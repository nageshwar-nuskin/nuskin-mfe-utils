import type { CSSProperties } from 'react';
import type { BranchOption } from './types';

export const DEFAULT_BRANCH = 'main';
export const PREVIEW_BRANCH_CHANGED_EVENT = 'mfe-preview-branch-changed';
export const BRANCH_MODAL_Z_INDEX = 2147483647;
export const BRANCH_SETTINGS_Z_INDEX = 2147483646;

export const DEFAULT_BRANCH_OPTIONS: BranchOption[] = [
  { id: 'main', label: 'Main' },
  { id: 'develop', label: 'Develop' },
];

const OPTION_BUTTON_BASE: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #ddd',
  cursor: 'pointer',
};

export function getBranchOptionButtonStyle(isActive: boolean): CSSProperties {
  return {
    ...OPTION_BUTTON_BASE,
    background: isActive ? '#111' : '#fff',
    color: isActive ? '#fff' : '#111',
  };
}
