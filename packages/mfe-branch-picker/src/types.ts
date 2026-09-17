export interface BranchOption {
  id: string;
  label: string;
}

export interface CreatePreviewBranchStoreOptions {
  storageKey: string;
  defaultBranch?: string;
  isEditing: () => boolean;
  eventName?: string;
}

export interface PreviewBranchStore {
  needsBranchSelection(): boolean;
  getCurrentBranch(): string;
  setPreviewBranch(branch: string): string;
}

export interface PreviewBranchChangedDetail {
  branch: string;
}

export interface BranchSelectorModalProps {
  isOpen: boolean;
  currentBranch?: string | null;
  onSelect: (branch: string) => void;
  onCancel: () => void;
  required?: boolean;
  options?: BranchOption[];
  title?: string;
  description?: string;
}

export interface BranchSettingsButtonProps {
  currentBranch?: string | null;
  onOpenSettings: () => void;
}
