import { createUrlBranchReader } from './url-branch';

describe('createUrlBranchReader', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
  });

  it('reads the first matching query param from a URL string', () => {
    const read = createUrlBranchReader(['cs_branch', 'branch']);
    expect(read('/us/en/page?branch=staging&cs_branch=develop')).toBe('develop');
  });

  it('falls through to later param names', () => {
    const read = createUrlBranchReader(['cs_branch', 'branch']);
    expect(read('/us/en/page?branch=staging')).toBe('staging');
  });

  it('reads window.location.search when no URL is passed', () => {
    Object.defineProperty(global.window, 'location', {
      configurable: true,
      value: { search: '?cs_branch=preview' },
    });
    const read = createUrlBranchReader();
    expect(read()).toBe('preview');
  });

  it('returns null when no branch param is present', () => {
    expect(createUrlBranchReader()('/us/en/page')).toBeNull();
  });
});
