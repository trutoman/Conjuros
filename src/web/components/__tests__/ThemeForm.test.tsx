import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { Theme } from '@conjuros/contracts';
import { ICON_ASSETS } from '../../lib/iconAssets';
import { ThemeForm } from '../ThemeForm';

const baseTheme: Theme = {
  id: 'theme-light',
  name: 'light',
  label: 'Light',
  colors: {
    pageBg: '#f7faf8',
    pageBgAccent: 'rgba(15, 23, 42, 0.04)',
    surface: '#ffffff',
    surfaceElevated: '#fffdfa',
    surfaceMuted: '#edf2ef',
    surfaceAlt: '#f4f8f6',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#cbd5e1',
    borderStrong: '#a5b4c3',
    primary: '#4f46e5',
    primaryStrong: '#4338ca',
    accentSoft: '#e0e7ff',
    danger: '#dc2626',
    success: '#15803d',
    warning: '#b45309',
    shadow: '0 14px 32px rgba(15, 23, 42, 0.08)',
  },
  fonts: { display: 'Display', body: 'Body', mono: 'Mono' },
  fontSizes: { heading: '2rem', body: '1rem', mono: '0.8rem' },
  backdrop: {
    pattern: 'grid',
    gridSize: '30px',
    lineWidth: '2px',
    glowPosition: 'center',
    glowSize: '20%',
    glowColor: '#112233',
  },
  useImageBackdrop: true,
  imageBackdrop: { storagePath: 'user/file.png', mimeType: 'image/png', sizeBytes: 1024 },
  iconAssets: ICON_ASSETS,
  kindColors: {
    command: '#7c3aed',
    webLink: '#2563eb',
    markdown: '#b45309',
    file: '#0d9488',
    attachment: '#be123c',
  },
  tagColorPalette: ['#111111', '#222222'],
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderForm(overrides: Partial<React.ComponentProps<typeof ThemeForm>> = {}) {
  render(
    <ThemeForm
      baseTheme={baseTheme}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      {...overrides}
    />,
  );
}

describe('ThemeForm base theme seeding', () => {
  it('seeds every editable token from the base theme', () => {
    renderForm({ existingNames: ['light', 'dark'] });

    expect(screen.getByLabelText('Name')).toHaveValue('light-copy');
    expect(screen.getByLabelText('Label')).toHaveValue('Light copy');
    expect(screen.getByLabelText('pageBg')).toHaveValue('#f7faf8');
    expect(screen.getByLabelText('command')).toHaveValue('#7c3aed');
    expect(screen.getByLabelText('Display font')).toHaveValue('Display');
    expect(screen.getByLabelText('Heading')).toHaveValue('2rem');
    expect(screen.getByLabelText('Glow color')).toHaveValue('#112233');
    expect(screen.getByLabelText('Palette hex 1')).toHaveValue('#111111');
  });

  it('does not inherit the image backdrop or the default flag', () => {
    renderForm({ existingNames: ['light', 'dark'] });

    expect(screen.getByLabelText('Use image backdrop')).not.toBeChecked();
    expect(screen.getByLabelText('Use image backdrop')).toBeDisabled();
    expect(screen.getByLabelText('Make site default')).not.toBeChecked();
    expect(screen.queryByText('An image is stored for this theme.')).not.toBeInTheDocument();
  });

  it('derives a unique name when the copy name is taken', () => {
    renderForm({ existingNames: ['light', 'light-copy', 'light-copy-2'] });

    expect(screen.getByLabelText('Name')).toHaveValue('light-copy-3');
  });

  it('keeps the identity editable', () => {
    renderForm({ existingNames: ['light'] });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'midnight' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Midnight' } });

    expect(screen.getByLabelText('Name')).toHaveValue('midnight');
    expect(screen.getByLabelText('Label')).toHaveValue('Midnight');
  });

  it('prefers the edited theme over a base theme', () => {
    renderForm({ theme: baseTheme, existingNames: ['light'] });

    expect(screen.getByLabelText('Name')).toHaveValue('light');
    expect(screen.getByLabelText('Label')).toHaveValue('Light');
    expect(screen.getByLabelText('Use image backdrop')).toBeChecked();
  });
});

describe('ThemeForm icon asset rows', () => {
  it('orders the icon, name, path, and viewBox in one row', () => {
    renderForm();

    const row = screen.getByLabelText('command path').closest('.theme-icon-row');
    const preview = row?.querySelector('.theme-icon-preview');
    const name = row?.querySelector('.theme-icon-name');
    const path = row?.querySelector('.theme-icon-path');
    const viewBox = row?.querySelector('.theme-icon-viewbox');

    expect(preview).toBeInTheDocument();
    expect(name).toHaveTextContent('command');
    expect(path).toBeInTheDocument();
    expect(viewBox).toBeInTheDocument();
    expect(preview?.nextElementSibling).toBe(name);
    expect(name?.nextElementSibling).toBe(path);
    expect(path?.nextElementSibling).toBe(viewBox);
  });

  it('sizes the viewBox field to its content', () => {
    renderForm();

    const viewBox = screen.getByLabelText('command viewBox');
    expect(viewBox).toHaveAttribute('size', '9');

    fireEvent.change(viewBox, { target: { value: '0 0 100 100' } });

    expect(viewBox).toHaveAttribute('size', '11');
  });

  it('renders each row as a flex row with a one-pixel border', () => {
    const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');

    expect(css).toMatch(/\.theme-icon-assets\s*\{[^}]*flex-direction:\s*column;/);
    expect(css).toMatch(
      /\.theme-icon-row\s*\{[^}]*display:\s*flex;[^}]*border:\s*1px solid var\(--border\);/,
    );
  });
});

describe('ThemeForm color fields', () => {
  it('shows a swatch for every color token except shadow', () => {
    renderForm();

    expect(document.querySelectorAll('.color-input-swatch')).toHaveLength(22);
    const pageBgSwatch = screen
      .getByLabelText('pageBg')
      .closest('.color-input')
      ?.querySelector('.color-input-swatch');
    expect(pageBgSwatch).toHaveStyle({ backgroundColor: '#f7faf8' });
  });

  it('updates the swatch as the value changes', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('pageBg'), { target: { value: '#123456' } });

    const pageBgSwatch = screen
      .getByLabelText('pageBg')
      .closest('.color-input')
      ?.querySelector('.color-input-swatch');
    expect(pageBgSwatch).toHaveStyle({ backgroundColor: '#123456' });
  });

  it('keeps the composite shadow field without a swatch', () => {
    renderForm();

    const shadowField = screen.getByLabelText('shadow').closest('.form-field');
    expect(shadowField?.querySelector('.color-input')).not.toBeInTheDocument();
  });

  it('keeps a color picker swatch in palette rows', () => {
    renderForm();

    const paletteRow = screen.getByLabelText('Palette hex 1').closest('.color-input');
    expect(paletteRow?.querySelector('input[type="color"]')).toHaveAttribute(
      'aria-label',
      'Palette color 1',
    );
  });
});
