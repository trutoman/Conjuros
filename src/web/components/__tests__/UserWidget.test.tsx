import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserWidget } from '../UserWidget';

describe('UserWidget', () => {
  it('renders the logged-in user label and triggers sign out from the icon action', () => {
    const onSignOut = vi.fn();
    render(<UserWidget userLabel="alicia" onSignOut={onSignOut} />);

    expect(screen.getByText('alicia')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign out alicia' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not trigger sign out when clicking the user label text directly', () => {
    const onSignOut = vi.fn();
    render(<UserWidget userLabel="alicia" onSignOut={onSignOut} />);

    fireEvent.click(screen.getByText('alicia'));

    expect(onSignOut).not.toHaveBeenCalled();
  });
});
