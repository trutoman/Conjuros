import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
      backdrop: { pattern: 'lines', gridSize: '40px', lineWidth: '1px', glowPosition: 'top-right', glowSize: '30%', glowColor: 'rgba(15, 23, 42, 0.04)' },
      iconAssets: ['command', 'copy'],
      kindColors: { command: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488', attachment: '#be123c' },
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
      backdrop: { pattern: 'lines', gridSize: '40px', lineWidth: '1px', glowPosition: 'top-right', glowSize: '30%', glowColor: 'rgba(148, 163, 184, 0.08)' },
      iconAssets: ['command', 'copy'],
      kindColors: { command: '#c084fc', webLink: '#60a5fa', markdown: '#fbbf24', file: '#2dd4bf', attachment: '#fb7185' },
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

vi.mock('../../hooks/useTagCategories', () => ({
  useTagCategories: () => ({
    categories: [],
    total: 0,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  }),
}));

vi.mock('../../hooks/useThemes', () => ({
  useThemes: () => themesState,
}));

describe('CollectionPage admin theme management', () => {
  function openThemeEditor(role: 'admin' | 'user' = 'admin') {
    render(
      <CollectionPage
        role={role}
        currentUserLabel="alicia"
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme editor' }));
  }

  it('does not offer a theme control in the tags sidebar footer', () => {
    render(<CollectionPage role="admin" currentUserLabel="alicia" onSignOut={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Themes' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('hides the theme editor entry for non-admin users', () => {
    render(<CollectionPage role="user" currentUserLabel="alicia" onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    expect(screen.queryByRole('menuitem', { name: 'Theme editor' })).not.toBeInTheDocument();
  });

  it('shows the theme editor entry for admin users', () => {
    render(<CollectionPage role="admin" currentUserLabel="alicia" onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    expect(screen.getByRole('menuitem', { name: 'Theme editor' })).toBeInTheDocument();
  });

  it('opens the theme management view and lists labels with the default marker', () => {
    openThemeEditor();

    expect(screen.getByRole('heading', { name: 'Manage themes' })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
  });

  it('shows no color swatch or internal theme name in the theme list', () => {
    openThemeEditor();

    expect(screen.queryByText('light')).not.toBeInTheDocument();
    expect(screen.queryByText('dark')).not.toBeInTheDocument();
    expect(document.querySelector('.theme-list-preview')).not.toBeInTheDocument();
  });

  it('routes activation to the activate mutation', () => {
    openThemeEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Make Dark the default' }));

    expect(themesState.activate).toHaveBeenCalledWith('theme-dark');
  });

  it('routes deletion through the confirm dialog', async () => {
    openThemeEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Dark' }));
    expect(screen.getByRole('heading', { name: 'Delete Dark theme?' })).toBeInTheDocument();

    expect(themesState.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
    await waitFor(() => expect(themesState.remove).toHaveBeenCalledWith('theme-dark'));
  });

  it('offers exactly one Add theme control as an icon button', () => {
    openThemeEditor();

    const addThemeButtons = screen.getAllByRole('button', { name: 'Add theme' });
    expect(addThemeButtons).toHaveLength(1);
    expect(addThemeButtons[0].classList.contains('add-item-button')).toBe(true);
    expect(addThemeButtons[0].querySelector('svg.icon')).toBeInTheDocument();
  });

  it('opens the base theme picker from Add theme', () => {
    openThemeEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Add theme' }));

    const picker = screen.getByRole('dialog', { name: 'Choose a base theme' });
    expect(within(picker).getByRole('radiogroup', { name: 'Base theme' })).toBeInTheDocument();
    expect(within(picker).getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
  });

  it('prefills the new theme from the chosen base theme', () => {
    openThemeEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add theme' }));

    const picker = screen.getByRole('dialog', { name: 'Choose a base theme' });
    fireEvent.click(within(picker).getByRole('radio', { name: 'Dark' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Create from theme' }));

    const form = screen.getByRole('dialog', { name: 'Add theme' });
    expect(form.classList.contains('modal-panel-extra-wide')).toBe(true);
    expect(within(form).getByLabelText('Name')).toHaveValue('dark-copy');
    expect(within(form).getByLabelText('Label')).toHaveValue('Dark copy');
    expect(within(form).getByLabelText('pageBg')).toHaveValue('#020617');
    expect(within(form).getByLabelText('command')).toHaveValue('#c084fc');
  });

  it('opens no theme form when the base step is cancelled', () => {
    openThemeEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add theme' }));

    const picker = screen.getByRole('dialog', { name: 'Choose a base theme' });
    fireEvent.click(within(picker).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Choose a base theme' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Add theme' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage themes' })).toBeInTheDocument();
  });

  it('opens a theme selector for a regular user and applies the saved choice', async () => {
    const onThemeChange = vi.fn().mockResolvedValue(undefined);
    render(<CollectionPage role="user" currentUserLabel="alicia" onSignOut={vi.fn()} themeId="theme-light" onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme selector' }));
    expect(screen.getByRole('dialog', { name: 'Theme selector' })).toBeInTheDocument();
    expect(screen.getByText('Light', { selector: 'span' })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Dark'));
    fireEvent.click(screen.getByRole('button', { name: 'Save theme preferences' }));

    await waitFor(() => expect(onThemeChange).toHaveBeenCalledWith('theme-dark'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Theme selector' })).not.toBeInTheDocument());
  });

  it('does not save a theme choice when the selector is cancelled', () => {
    const onThemeChange = vi.fn();
    render(<CollectionPage role="user" currentUserLabel="alicia" onSignOut={vi.fn()} themeId="theme-light" onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'alicia' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme selector' }));
    fireEvent.click(screen.getByLabelText('Dark'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onThemeChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Theme selector' })).not.toBeInTheDocument();
  });
});
