import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserWidget } from '../UserWidget';

describe('UserWidget', () => {
  it('opens the user menu with the expected entries', () => {
    render(<UserWidget userLabel="alicia" onSignOut={vi.fn()} onThemeSelector={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Theme selector' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Theme editor' })).not.toBeInTheDocument();
  });

  it('shows the theme editor entry only when it is provided', () => {
    const { rerender } = render(<UserWidget userLabel="alicia" onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    expect(screen.queryByRole('menuitem', { name: 'Theme editor' })).not.toBeInTheDocument();

    rerender(<UserWidget userLabel="alicia" onSignOut={vi.fn()} onThemeEditor={vi.fn()} />);
    expect(screen.getByRole('menuitem', { name: 'Theme editor' })).toBeInTheDocument();
  });

  it('opens the theme editor and closes the menu', () => {
    const onThemeEditor = vi.fn();
    render(<UserWidget userLabel="alicia" onSignOut={vi.fn()} onThemeEditor={onThemeEditor} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme editor' }));

    expect(onThemeEditor).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens theme selection and closes the menu', () => {
    const onThemeSelector = vi.fn();
    render(<UserWidget userLabel="alicia" onSignOut={vi.fn()} onThemeSelector={onThemeSelector} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme selector' }));

    expect(onThemeSelector).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('signs out from the menu', () => {
    const onSignOut = vi.fn();
    render(<UserWidget userLabel="alicia" onSignOut={onSignOut} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('closes on Escape or an outside click', () => {
    render(<UserWidget userLabel="alicia" onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
