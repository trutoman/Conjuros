import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Theme } from '@conjuros/contracts';
import { ThemeToggle } from '../ThemeToggle';

const themes = [
  { id: 'theme-light', name: 'light' },
  { id: 'theme-dark', name: 'dark' },
  { id: 'theme-custom', name: 'parchment' },
] as unknown as Theme[];

describe('ThemeToggle', () => {
  it('marks the saved light theme and emits the dark theme id', () => {
    const onChange = vi.fn();
    render(<ThemeToggle themeId="theme-light" themes={themes} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(onChange).toHaveBeenCalledWith('theme-dark');
  });

  it('leaves both options unpressed for a custom theme', () => {
    render(<ThemeToggle themeId="theme-custom" themes={themes} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables light and dark options if those themes are unavailable', () => {
    render(<ThemeToggle themeId="theme-custom" themes={[themes[2]]} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Light mode' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeDisabled();
  });
});
