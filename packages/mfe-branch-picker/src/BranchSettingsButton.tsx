import { createPortal } from 'react-dom';
import { BRANCH_SETTINGS_Z_INDEX } from './constants';
import type { BranchSettingsButtonProps } from './types';

export type { BranchSettingsButtonProps };

export function BranchSettingsButton({
  currentBranch,
  onOpenSettings,
}: BranchSettingsButtonProps) {
  const branchLabel =
    typeof currentBranch === 'string' ? currentBranch.trim() : '';

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      data-ns-branch-settings=""
      style={{
        position: 'fixed',
        top: 5,
        left: 5,
        zIndex: BRANCH_SETTINGS_Z_INDEX,
        display: 'inline-flex',
        alignItems: 'stretch',
        maxWidth: 'calc(100vw - 10px)',
        background: '#fff',
        border: '1px solid #f0d0d0',
        borderRadius: 6,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      <style>{`
        [data-ns-branch-settings],
        [data-ns-branch-settings] * {
          cursor: pointer !important;
        }
      `}</style>
      {branchLabel ? (
        <span
          title={`Branch: ${branchLabel}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 10px',
            minWidth: 0,
            fontSize: 12,
            lineHeight: 1,
            color: '#888',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#aaa',
              flexShrink: 0,
            }}
          >
            Branch
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#333',
              textTransform: 'lowercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 160,
            }}
          >
            {branchLabel}
          </span>
        </span>
      ) : null}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Open preview settings"
        title="Preview settings"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          flexShrink: 0,
          border: 'none',
          borderLeft: branchLabel ? '1px solid #f0f0f0' : 'none',
          background: 'transparent',
          color: '#888',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ⚙
      </button>
    </div>,
    document.body,
  );
}
