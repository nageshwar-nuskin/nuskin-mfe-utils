import { DEFAULT_BRANCH, PREVIEW_BRANCH_CHANGED_EVENT } from './constants';
import type {
  CreatePreviewBranchStoreOptions,
  PreviewBranchStore,
} from './types';

export function createPreviewBranchStore({
  storageKey,
  defaultBranch = DEFAULT_BRANCH,
  isEditing,
  eventName = PREVIEW_BRANCH_CHANGED_EVENT,
}: CreatePreviewBranchStoreOptions): PreviewBranchStore {
  let branch = defaultBranch;
  let previewBranchSelected = false;

  function readStoredPreviewBranch(): string | null {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return typeof stored === 'string' && stored.trim() ? stored.trim() : null;
    } catch {
      return null;
    }
  }

  function writeStoredPreviewBranch(next: string): void {
    try {
      sessionStorage.setItem(storageKey, next);
    } catch {
      // sessionStorage may be unavailable in some iframe contexts
    }
  }

  function applyBranch(nextBranch: string): string {
    const next = nextBranch || defaultBranch;
    branch = next;
    return next;
  }

  function syncEditingBranchFromStorage(): void {
    if (typeof window === 'undefined' || !isEditing()) return;

    const stored = readStoredPreviewBranch();
    if (stored) {
      previewBranchSelected = true;
      applyBranch(stored);
    }
  }

  function syncNonEditingBranch(): string {
    previewBranchSelected = false;
    return applyBranch(defaultBranch);
  }

  function syncBranch(): string {
    if (typeof window !== 'undefined' && isEditing()) {
      syncEditingBranchFromStorage();
      return branch;
    }
    return syncNonEditingBranch();
  }

  return {
    needsBranchSelection() {
      if (typeof window === 'undefined' || !isEditing()) return false;
      syncEditingBranchFromStorage();
      if (readStoredPreviewBranch()) return false;
      return !previewBranchSelected;
    },

    getCurrentBranch() {
      if (typeof window !== 'undefined') {
        syncBranch();
      }
      return branch;
    },

    setPreviewBranch(nextBranch: string) {
      previewBranchSelected = true;
      const next = applyBranch(nextBranch);
      if (typeof window !== 'undefined' && isEditing()) {
        writeStoredPreviewBranch(next);
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { branch: next },
          }),
        );
      }
      return next;
    },
  };
}
