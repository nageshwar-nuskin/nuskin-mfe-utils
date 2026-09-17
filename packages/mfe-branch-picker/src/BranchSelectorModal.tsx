import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  BRANCH_MODAL_Z_INDEX,
  DEFAULT_BRANCH,
  DEFAULT_BRANCH_OPTIONS,
  getBranchOptionButtonStyle,
} from './constants';
import type { BranchSelectorModalProps } from './types';

const REQUIRED_TITLE = 'Select preview branch';
const SETTINGS_TITLE = 'Preview settings';
const REQUIRED_DESCRIPTION =
  'Choose which preview branch to load content from for this preview session.';
const SETTINGS_DESCRIPTION =
  'Review the active branch and update it to load content from a different preview branch.';

export type { BranchSelectorModalProps };

export function BranchSelectorModal({
  isOpen,
  currentBranch,
  onSelect,
  onCancel,
  required = true,
  options = DEFAULT_BRANCH_OPTIONS,
  title,
  description,
}: BranchSelectorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedRef = useRef<string | null>(null);
  const [selected, setSelected] = useState(() => {
    const value = typeof currentBranch === 'string' ? currentBranch.trim() : '';
    return value || DEFAULT_BRANCH;
  });

  useEffect(() => {
    const value = typeof currentBranch === 'string' ? currentBranch.trim() : '';
    if (value) {
      setSelected(value);
      selectedRef.current = value;
    }
  }, [currentBranch]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (typeof dialog.showModal === 'function' && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const { body } = document;
    const previousCursor = body.style.getPropertyValue('cursor');
    const previousPriority = body.style.getPropertyPriority('cursor');
    body.style.setProperty('cursor', 'auto', 'important');
    return () => {
      if (previousCursor) {
        body.style.setProperty('cursor', previousCursor, previousPriority);
      } else {
        body.style.removeProperty('cursor');
      }
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (required) {
      event.preventDefault();
      return;
    }
    onCancel?.();
  };

  const selectBranchOption = (nextBranch: string) => {
    if (required) {
      onSelect(nextBranch);
      return;
    }
    selectedRef.current = nextBranch;
    setSelected(nextBranch);
  };

  const heading = title ?? (required ? REQUIRED_TITLE : SETTINGS_TITLE);
  const body =
    description ?? (required ? REQUIRED_DESCRIPTION : SETTINGS_DESCRIPTION);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label="Select preview branch"
      data-ns-branch-modal=""
      onCancel={handleDialogCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: BRANCH_MODAL_Z_INDEX,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        margin: 0,
        padding: 16,
        border: 0,
        background: 'rgba(0,0,0,0.45)',
        cursor: 'default',
      }}
    >
      <style>{`
        [data-ns-branch-modal],
        [data-ns-branch-modal] * {
          cursor: default !important;
        }
        [data-ns-branch-modal] button {
          cursor: pointer !important;
        }
      `}</style>
      <div
        style={{
          width: 'min(520px, 100%)',
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          cursor: 'default',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, lineHeight: '24px' }}>{heading}</h2>
        <p style={{ margin: '8px 0 16px', color: '#444', lineHeight: '20px' }}>
          {body}
        </p>

        {required ? null : (
          <p style={{ margin: '0 0 12px', color: '#222' }}>
            <strong>Active</strong>{' '}
            <span style={{ opacity: 0.8 }}>{currentBranch || DEFAULT_BRANCH}</span>
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectBranchOption(option.id)}
              style={getBranchOptionButtonStyle(selected === option.id)}
            >
              {option.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => onCancel?.()}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#f6f6f6',
              color: '#111',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          {required ? null : (
            <button
              type="button"
              onClick={() => onSelect(selectedRef.current || selected)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #ddd',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Update branch
            </button>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
