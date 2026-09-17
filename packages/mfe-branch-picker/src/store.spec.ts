import { createPreviewBranchStore } from './store';
import { DEFAULT_BRANCH, PREVIEW_BRANCH_CHANGED_EVENT } from './constants';

const STORAGE_KEY = 'preview-branch:test';

describe('createPreviewBranchStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('always uses defaultBranch when not editing and does not require selection', () => {
    sessionStorage.setItem(STORAGE_KEY, 'develop');
    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => false,
    });

    expect(store.needsBranchSelection()).toBe(false);
    expect(store.getCurrentBranch()).toBe(DEFAULT_BRANCH);
  });

  it('requires branch selection in editing mode until setPreviewBranch is called', () => {
    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => true,
    });

    expect(store.needsBranchSelection()).toBe(true);
    store.setPreviewBranch('develop');
    expect(store.needsBranchSelection()).toBe(false);
    expect(store.getCurrentBranch()).toBe('develop');
  });

  it('restores the editing branch from sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEY, 'develop');
    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => true,
    });

    expect(store.needsBranchSelection()).toBe(false);
    expect(store.getCurrentBranch()).toBe('develop');
  });

  it('requires selection when sessionStorage getItem throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => true,
    });

    expect(store.needsBranchSelection()).toBe(true);
  });

  it('setPreviewBranch dispatches a window event while editing', () => {
    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => true,
    });
    const handler = jest.fn();
    window.addEventListener(PREVIEW_BRANCH_CHANGED_EVENT, handler);

    store.setPreviewBranch('develop');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ branch: 'develop' });
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('develop');
    window.removeEventListener(PREVIEW_BRANCH_CHANGED_EVENT, handler);
  });

  it('does not persist when not editing', () => {
    const store = createPreviewBranchStore({
      storageKey: STORAGE_KEY,
      isEditing: () => false,
    });
    const handler = jest.fn();
    window.addEventListener(PREVIEW_BRANCH_CHANGED_EVENT, handler);

    store.setPreviewBranch('develop');

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(store.getCurrentBranch()).toBe(DEFAULT_BRANCH);
    expect(handler).not.toHaveBeenCalled();
    window.removeEventListener(PREVIEW_BRANCH_CHANGED_EVENT, handler);
  });
});
