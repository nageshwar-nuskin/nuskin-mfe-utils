import contentstack from '@contentstack/delivery-sdk';
import ContentstackLivePreview from '@contentstack/live-preview-utils';
import { addEditableTags } from '@contentstack/utils';
import { createContentstackClient } from './createContentstackClient';
import { createUrlBranchReader } from './url-branch';

jest.mock('@contentstack/delivery-sdk', () => ({
  __esModule: true,
  default: {
    stack: jest.fn(),
  },
}), { virtual: true });

jest.mock('@contentstack/live-preview-utils', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    onEntryChange: jest.fn(),
  },
}), { virtual: true });

jest.mock('@contentstack/utils', () => ({
  addEditableTags: jest.fn(),
}), { virtual: true });

function createEntryChain() {
  const chain: Record<string, jest.Mock> = {};
  chain.locale = jest.fn(() => chain);
  chain.includeFallback = jest.fn(() => chain);
  chain.includeReference = jest.fn(() => chain);
  chain.query = jest.fn(() => chain);
  chain.fetch = jest.fn();
  chain.find = jest.fn();
  return chain;
}

function mockStack() {
  const entryChains: ReturnType<typeof createEntryChain>[] = [];
  const contentType = jest.fn(() => ({
    entry: jest.fn(() => {
      const chain = createEntryChain();
      entryChains.push(chain);
      return chain;
    }),
  }));
  const instance = {
    config: {
      apiKey: 'key',
      environment: 'env',
      live_preview: {},
      headers: {},
    },
    contentType,
  };
  (contentstack.stack as jest.Mock).mockReturnValue(instance);
  return { instance, entryChains, contentType };
}

const credentials = {
  apiKey: 'key',
  deliveryToken: 'token',
  environment: 'env',
  previewToken: 'preview',
};

function createClient(
  overrides: Partial<Parameters<typeof createContentstackClient>[0]> = {},
) {
  let branch = 'main';
  const client = createContentstackClient({
    ...credentials,
    getBranch: () => branch,
    isEditing: () => false,
    ...overrides,
  });
  return {
    client,
    setBranch: (next: string) => {
      branch = next;
    },
  };
}

describe('createContentstackClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStack();
    sessionStorage.clear();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { pathname: '/us/en/page', search: '', href: 'http://local/us/en/page' },
    });
  });

  it('creates a stack with credentials and the current branch', () => {
    const { client } = createClient();
    client.stack.contentType('page');
    expect(contentstack.stack).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'key',
        deliveryToken: 'token',
        environment: 'env',
        branch: 'main',
        live_preview: expect.objectContaining({
          enable: true,
          preview_token: 'preview',
          host: 'rest-preview.contentstack.com',
        }),
      }),
    );
  });

  it('recreates the stack when the preview branch changes while editing', () => {
    const { client, setBranch } = createClient({ isEditing: () => true });
    client.stack.contentType('a');
    setBranch('develop');
    client.stack.contentType('b');
    expect(contentstack.stack).toHaveBeenCalledTimes(2);
    expect((contentstack.stack as jest.Mock).mock.calls[1][0]).toHaveProperty(
      'branch',
      'develop',
    );
  });

  it('uses a URL branch when not editing', () => {
    const { client } = createClient({
      getUrlBranch: createUrlBranchReader(['cs_branch']),
    });
    client.setRequestUrl('/us/en/page?cs_branch=develop');
    client.stack.contentType('page');
    expect((contentstack.stack as jest.Mock).mock.calls[0][0]).toHaveProperty(
      'branch',
      'develop',
    );
  });

  it('ignores URL branch while editing', () => {
    const { client } = createClient({
      isEditing: () => true,
      getUrlBranch: createUrlBranchReader(['cs_branch']),
    });
    client.setRequestUrl('/us/en/page?cs_branch=staging');
    expect(client.getCurrentBranch()).toBe('main');
    client.stack.contentType('page');
    expect((contentstack.stack as jest.Mock).mock.calls[0][0]).toHaveProperty(
      'branch',
      'main',
    );
  });

  it('does not fetch when shouldFetch returns false', async () => {
    const { client } = createClient({
      shouldFetch: () => false,
    });
    await expect(
      client.getContent({ uid: '1', contentType: 'page', language: 'US-en' }),
    ).resolves.toBeNull();
    expect(contentstack.stack).not.toHaveBeenCalled();
  });

  it('returns null when credentials are missing', async () => {
    const { client } = createClient({
      apiKey: '',
      deliveryToken: '',
      environment: '',
      requireConfiguration: true,
    });
    expect(client.hasConfiguration()).toBe(false);
    await expect(
      client.getContent({ uid: '1', contentType: 'page' }),
    ).resolves.toBeNull();
  });

  it('fetches by uid and adds editable tags while editing', async () => {
    const chain = createEntryChain();
    chain.fetch.mockResolvedValue({ uid: '1' });
    (contentstack.stack as jest.Mock).mockReturnValue({
      config: { apiKey: 'key', environment: 'env' },
      contentType: jest.fn(() => ({
        entry: jest.fn(() => chain),
      })),
    });

    const { client } = createClient({ isEditing: () => true });
    const result = await client.getContent({
      uid: '1',
      contentType: 'page',
      language: 'US-en',
      referenceFields: ['hero'],
    });

    expect(result).toEqual({ uid: '1' });
    expect(chain.locale).toHaveBeenCalledWith('US-en');
    expect(chain.includeReference).toHaveBeenCalledWith(['hero']);
    expect(addEditableTags).toHaveBeenCalled();
  });

  it('retries with fallbackLocale when the first fetch fails', async () => {
    mockStack();
    const { client } = createClient();
    const first = createEntryChain();
    const second = createEntryChain();
    first.fetch.mockRejectedValue(new Error('missing'));
    second.fetch.mockResolvedValue({ uid: 'ok' });
    let calls = 0;
    (contentstack.stack as jest.Mock).mockReturnValue({
      config: { apiKey: 'key', environment: 'env' },
      contentType: jest.fn(() => ({
        entry: jest.fn(() => {
          calls += 1;
          return calls === 1 ? first : second;
        }),
      })),
    });

    const result = await client.getContent({
      uid: '1',
      contentType: 'page',
      language: 'US-en',
      fallbackLocale: 'CA-fr',
    });
    expect(result).toEqual({ uid: 'ok' });
    expect(first.locale).toHaveBeenCalledWith('US-en');
    expect(second.locale).toHaveBeenCalledWith('CA-fr');
  });

  it('initializes live preview once', () => {
    const { client } = createClient({
      livePreview: { enable: true, cleanCslpOnProduction: false },
    });
    client.initLivePreview();
    client.initLivePreview();
    expect(ContentstackLivePreview.init).toHaveBeenCalledTimes(1);
    expect(ContentstackLivePreview.init).toHaveBeenCalledWith(
      expect.objectContaining({
        ssr: false,
        enable: true,
        mode: 'builder',
        editButton: { enable: false },
      }),
    );
  });

  it('skips live preview when credentials are missing', () => {
    const { client } = createClient({
      apiKey: '',
      deliveryToken: '',
      environment: '',
      requireConfiguration: true,
    });
    client.initLivePreview();
    expect(ContentstackLivePreview.init).not.toHaveBeenCalled();
  });

  it('does not fetch when contentType is missing', async () => {
    const { client } = createClient();
    await expect(
      client.getContent({ language: 'US-en', url: '/products/wellness' }),
    ).resolves.toBeNull();
    expect(contentstack.stack).not.toHaveBeenCalled();
  });

  it('returns null when a query find result has no entries', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const chain = createEntryChain();
    chain.find.mockResolvedValue(undefined);
    (contentstack.stack as jest.Mock).mockReturnValue({
      config: { apiKey: 'key', environment: 'env' },
      contentType: jest.fn(() => ({
        entry: jest.fn(() => chain),
      })),
    });

    const { client } = createClient();
    await expect(
      client.getContent({
        url: '/products/wellness',
        contentType: 'plp_builder',
        language: 'US-en',
      }),
    ).resolves.toBeNull();
    expect(warning).not.toHaveBeenCalled();
    warning.mockRestore();
  });

  it('reports fetch errors through onError', async () => {
    const onError = jest.fn();
    (contentstack.stack as jest.Mock).mockImplementation(() => {
      throw new Error('SDK unavailable');
    });
    const { client } = createClient({ onError });

    await expect(
      client.getContent({
        uid: '1',
        contentType: 'page',
        language: 'US-en',
      }),
    ).resolves.toBeNull();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('recreates the stack when setBranch changes the branch', () => {
    let branch = 'main';
    const client = createContentstackClient({
      ...credentials,
      getBranch: () => branch,
      isEditing: () => true,
    });
    client.stack.contentType('a');
    branch = 'develop';
    client.setBranch('develop');
    client.stack.contentType('b');
    expect(contentstack.stack).toHaveBeenCalledTimes(2);
    expect((contentstack.stack as jest.Mock).mock.calls[1][0]).toHaveProperty(
      'branch',
      'develop',
    );
  });
});
