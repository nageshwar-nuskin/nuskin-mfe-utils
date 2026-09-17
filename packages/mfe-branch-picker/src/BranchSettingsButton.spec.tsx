import { render, screen } from '@testing-library/react';
import { BranchSettingsButton } from './BranchSettingsButton';

describe('BranchSettingsButton', () => {
  it('shows current branch and calls onOpenSettings', () => {
    const onOpenSettings = jest.fn();
    render(
      <BranchSettingsButton currentBranch="develop" onOpenSettings={onOpenSettings} />,
    );

    expect(screen.getByText(/branch/i)).toBeInTheDocument();
    expect(screen.getByText(/develop/i)).toBeInTheDocument();

    screen.getByRole('button', { name: /open preview settings/i }).click();
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('renders without branch label when currentBranch is empty', () => {
    const onOpenSettings = jest.fn();
    render(<BranchSettingsButton currentBranch="" onOpenSettings={onOpenSettings} />);
    expect(
      screen.getByRole('button', { name: /open preview settings/i }),
    ).toBeInTheDocument();
  });

  it('renders without branch label when currentBranch is not a string', () => {
    render(
      <BranchSettingsButton currentBranch={null} onOpenSettings={jest.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: /open preview settings/i }),
    ).toBeInTheDocument();
  });

  it('marks the control with data-ns-branch-settings', () => {
    render(
      <BranchSettingsButton currentBranch="main" onOpenSettings={jest.fn()} />,
    );

    const button = screen.getByRole('button', {
      name: /open preview settings/i,
    });
    const root = button.closest('[data-ns-branch-settings]');
    expect(root).not.toBeNull();
    expect(root).toHaveStyle({ cursor: 'pointer' });
  });
});
