import { fireEvent, render, screen } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import { BranchSelectorModal } from './BranchSelectorModal';

describe('BranchSelectorModal', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = jest.fn(function showModal(this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn(function closeDialog(this: HTMLDialogElement) {
      this.open = false;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens the native dialog with showModal and closes it on unmount', () => {
    const { unmount } = render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    unmount();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('selects main immediately in required mode', () => {
    const onSelect = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="develop"
        onSelect={onSelect}
        onCancel={jest.fn()}
      />,
    );

    screen.getByRole('button', { name: /^main$/i }).click();
    expect(onSelect).toHaveBeenCalledWith('main');
  });

  it('prevents dialog cancel in required mode so Escape cannot dismiss the picker', () => {
    const onCancel = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: /select preview branch/i,
    });
    Simulate.cancel(dialog);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('closes settings mode when the dialog cancel event fires', () => {
    const onCancel = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required={false}
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: /select preview branch/i,
    });
    Simulate.cancel(dialog);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders required picker and selects develop immediately', () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="main"
        onSelect={onSelect}
        onCancel={onCancel}
      />,
    );

    screen.getByRole('button', { name: /develop/i }).click();
    expect(onSelect).toHaveBeenCalledWith('develop');
  });

  it('calls onCancel when cancel is clicked', () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="main"
        onSelect={onSelect}
        onCancel={onCancel}
      />,
    );

    screen.getByRole('button', { name: /cancel/i }).click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders settings mode and updates branch via Update branch button', () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();
    render(
      <BranchSelectorModal
        isOpen
        required={false}
        currentBranch="main"
        onSelect={onSelect}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /develop/i }));
    fireEvent.click(screen.getByRole('button', { name: /update branch/i }));
    expect(onSelect).toHaveBeenCalledWith('develop');
  });

  it('restores a visible cursor while open so body cursor:none does not hide it', () => {
    document.body.style.setProperty('cursor', 'none');
    const { unmount } = render(
      <BranchSelectorModal
        isOpen
        required={false}
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: /select preview branch/i,
    });
    expect(dialog).toHaveAttribute('data-ns-branch-modal');
    expect(document.body.style.getPropertyValue('cursor')).toBe('auto');
    expect(document.body.style.getPropertyPriority('cursor')).toBe('important');

    unmount();
    expect(document.body.style.getPropertyValue('cursor')).toBe('none');
    document.body.style.removeProperty('cursor');
  });

  it('treats omitted required as a blocking picker', () => {
    render(
      <BranchSelectorModal
        isOpen
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText('Select preview branch')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /update branch/i }),
    ).not.toBeInTheDocument();
  });

  it('shows main as the active branch when settings mode has no current branch', () => {
    render(
      <BranchSelectorModal
        isOpen
        required={false}
        currentBranch=""
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('Preview settings')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <BranchSelectorModal
        isOpen={false}
        required
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('defaults to main when currentBranch is not a usable string', () => {
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch={null}
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /^main$/i })).toBeInTheDocument();
  });

  it('clears an empty cursor override when the modal unmounts', () => {
    document.body.style.removeProperty('cursor');
    const { unmount } = render(
      <BranchSelectorModal
        isOpen
        required={false}
        currentBranch="main"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(document.body.style.getPropertyValue('cursor')).toBe('auto');
    unmount();
    expect(document.body.style.getPropertyValue('cursor')).toBe('');
  });

  it('skips showModal when the native dialog API is missing', () => {
    HTMLDialogElement.prototype.showModal = undefined as unknown as typeof HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.close = undefined as unknown as typeof HTMLDialogElement.prototype.close;
    expect(() =>
      render(
        <BranchSelectorModal
          isOpen
          required
          currentBranch="main"
          onSelect={jest.fn()}
          onCancel={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('uses title and description overrides when provided', () => {
    render(
      <BranchSelectorModal
        isOpen
        required
        currentBranch="main"
        title="Choose a branch"
        description="Pick a preview branch for this session."
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText('Choose a branch')).toBeInTheDocument();
    expect(
      screen.getByText('Pick a preview branch for this session.'),
    ).toBeInTheDocument();
  });
});
