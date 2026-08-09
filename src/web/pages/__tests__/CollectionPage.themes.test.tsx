import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionPage } from '../CollectionPage';

const collectionState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
};

const tagsState = {
  tags: [],
  total: 0,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
};

const themesState = {
  themes: [
    {
      id: 'theme-light',
      name: 'light',
      label: 'Light',
      colors: {
        pageBg: '#f7faf8', pageBgAccent: 'rgba(15, 23, 42, 0.04)', surface: '#ffffff', surfaceElevated: '#fffdfa',
        surfaceMuted: '#edf2ef', surfaceAlt: '#f4f8f6', text: '#0f172a', textMuted: '#475569', border: '#cbd5e1',
        borderStrong: '#a5b4c3', primary: '#4f46e5', primaryStrong: '#4338ca', accentSoft: '#e0e7ff', danger: '#dc2626',
        success: '#15803d', warning: '#b45309', shadow: '0 14px 32px rgba(15, 23, 42, 0.08)',
      },
      fonts: { display: "'Cinzel', serif", body: "'Cormorant Garamond', serif", mono: "'Cutive Mono', monospace" },
      fontSizes: { heading: '2.65rem', body: '1rem', mono: '0.75rem' },
      iconAssets: ['spell', 'copy'],
      kindColors: { spell: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488' },
      tagColorPalette: ['#1A73E8', '#7C3AED'],
      isDefault: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'theme-dark',
      name: 'dark',
      label: 'Dark',
      colors: {
        pageBg: '#020617', pageBgAccent: 'rgba(148, 163, 184, 0.08)', surface: '#0f172a', surfaceElevated: '#111827',
        surfaceMuted: '#1e293b', surfaceAlt: '#0b1120', text: '#e2e8f0', textMuted: '#94a3b8', border: '#334155',
        borderStrong: '#475569', primary: '#818cf8', primaryStrong: '#6366f1', accentSoft: 'rgba(99, 102, 241, 0.2)',
        danger: '#f87171', success: '#4ade80', warning: '#fbbf24', shadow: '0 18px 40px rgba(2, 6, 23, 0.45)',
      },
      fonts: { display: "'Cinzel', serif", body: "'Cormorant Garamond', serif", mono: "'Cutive Mono', monospace" },
      fontSizes: { heading: '2.65rem', body: '1rem', mono: '0.75rem' },
      iconAssets: ['spell', 'copy'],
      kindColors: { spell: '#c084fc', webLink: '#60a5fa', markdown: '#fbbf24', file: '#2dd4bf' },
      tagColorPalette: ['#1A73E8', '#7C3AED'],
      isDefault: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  total: 2,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  activate: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => collectionState,
}));

vi.mock('../../hooks/useTags', () => ({
  useTags: () => tagsState,
}));

vi.mock('../../hooks/useThemes', () => ({
  useThemes: () => themesState,
}));

describe('CollectionPage admin theme management', () => {
  it('hides the theme management entry for non-admin users', () => {
    render(<CollectionPage role="user" />);
    expect(screen.queryByRole('button', { name: 'Themes' })).not.toBeInTheDocument();
  });

  it('shows the theme management entry for admin users', () => {
    render(<CollectionPage role="admin" />);
    expect(screen.getByRole('button', { name: 'Themes' })).toBeInTheDocument();
  });

  it('open the theme management view and lists themes with default marker', () => {
    render(<CollectionPage role="admin" />);
    fireEvent.click(screen.getByRole('button', { name: 'Themes' }));

    expect(screen.getByRole('heading', { name: 'Manage themes' })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('light · default')).toBeInTheDocument();
  });

  it('routes activation to the activate mutation', () => {
    render(<CollectionPage role="admin" />);
    fireEvent.click(screen.getByRole('button', { name: 'Themes' }));

    fireEvent.click(screen.getByRole('button', { name: 'Make Dark the default' }));

    expect(themesState.activate).toHaveBeenCalledWith('theme-dark');
  });

  it('routes deletion through the confirm dialog', async () => {
    render(<CollectionPage role="admin" />);
    fireEvent.click(screen.getByRole('button', { name: 'Themes' }));

    fireEvent.click(screen.getByRole('button', { name: 'Delete Dark' }));
    expect(screen.getByRole('heading', { name: 'Delete Dark theme?' })).toBeInTheDocument();

    expect(themesState.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
    await waitFor(() => expect(themesState.remove).toHaveBeenCalledWith('theme-dark'));
  });

  it('opens the theme form to add a new theme', () => {
    render(<CollectionPage role="admin" />);
    fireEvent.click(screen.getByRole('button', { name: 'Themes' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Add theme' })[0]);

    expect(screen.getByRole('heading', { name: 'Add theme' })).toBeInTheDocument();
  });
});