import { createIsEditingMode } from './editing-mode';

function setLocation({
  search = '',
  pathname = '/us/en/page',
}: {
  search?: string;
  pathname?: string;
} = {}) {
  const normalized = !search || search.startsWith('?') ? search : `?${search}`;
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      search: normalized,
      pathname,
      href: `http://localhost${pathname}${normalized}`,
    },
  });
  Object.defineProperty(window, 'self', {
    configurable: true,
    value: window,
  });
  Object.defineProperty(window, 'top', {
    configurable: true,
    value: window,
  });
}

describe('createIsEditingMode', () => {
  const isEditing = createIsEditingMode({ mfe: 'product-list' });

  beforeEach(() => {
    setLocation();
  });

  it('returns false during SSR', () => {
    const originalWindow = global.window;
    // @ts-expect-error jsdom window deletion
    delete global.window;
    expect(isEditing()).toBe(false);
    global.window = originalWindow;
  });

  it('returns true when the mfe query param matches', () => {
    setLocation({ search: '?mfe=product-list' });
    expect(isEditing()).toBe(true);
  });

  it('returns false when the mfe query param is for a different MFE', () => {
    setLocation({
      search: '?mfe=header&live_preview=true&visual-builder=true',
    });
    expect(isEditing()).toBe(false);
  });

  it('falls back to live preview query params when mfe is absent', () => {
    setLocation({ search: '?live_preview=true' });
    expect(isEditing()).toBe(true);
    setLocation({ search: '?visual-builder=true' });
    expect(isEditing()).toBe(true);
    setLocation({ search: '?contentstack=true' });
    expect(isEditing()).toBe(true);
    setLocation({ search: '' });
    expect(isEditing()).toBe(false);
  });

  it('falls back to iframe detection when mfe is absent', () => {
    setLocation({ search: '' });
    Object.defineProperty(window, 'top', {
      configurable: true,
      value: { other: true },
    });
    expect(isEditing()).toBe(true);
  });

  it('skips iframe detection when detectIframe is false', () => {
    const headerEditing = createIsEditingMode({
      mfe: 'header',
      detectIframe: false,
    });
    setLocation({ search: '' });
    Object.defineProperty(window, 'top', {
      configurable: true,
      value: { other: true },
    });
    expect(headerEditing()).toBe(false);
  });

  it('requires pathnameIncludes when mfe is absent', () => {
    const headerEditing = createIsEditingMode({
      mfe: 'header',
      detectIframe: false,
      pathnameIncludes: '/global-header/header',
      queryParams: [
        'visual-builder',
        'contentstack',
        'live_preview',
        'builder',
        'entry_uid',
      ],
    });

    setLocation({
      search: '?entry_uid=abc',
      pathname: '/us/en/product/some-product',
    });
    expect(headerEditing()).toBe(false);

    setLocation({
      search: '?entry_uid=abc',
      pathname: '/us/en/global-header/header',
    });
    expect(headerEditing()).toBe(true);
  });

  it('treats a matching mfe param as editing even off the dedicated pathname', () => {
    const headerEditing = createIsEditingMode({
      mfe: 'header',
      detectIframe: false,
      pathnameIncludes: '/global-header/header',
    });
    setLocation({
      search: '?mfe=header',
      pathname: '/us/en/product/some-product',
    });
    expect(headerEditing()).toBe(true);
  });
});
