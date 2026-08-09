import { randomUUID } from 'node:crypto';
import type { Theme } from '@conjuros/contracts';
import type { StoredTheme } from './themes.repository';

const lightTheme: Theme = {
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
  fonts: {
    display: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
    mono: "'Cutive Mono', monospace",
  },
  fontSizes: {
    heading: '2.65rem',
    body: '1rem',
    mono: '0.75rem',
  },
  iconAssets: [
    'spell',
    'web-link',
    'markdown',
    'file',
    'copy',
    'open',
    'view',
    'download',
    'menu',
    'edit',
    'delete',
    'confirm',
    'cancel',
    'expand',
    'collapse',
    'search',
  ],
  kindColors: {
    spell: '#7c3aed',
    webLink: '#2563eb',
    markdown: '#b45309',
    file: '#0d9488',
  },
  tagColorPalette: [
    '#1A73E8',
    '#7C3AED',
    '#2563EB',
    '#B45309',
    '#0D9488',
    '#DC2626',
    '#15803D',
    '#DB2777',
    '#EA580C',
    '#0EA5E9',
  ],
  isDefault: true,
  createdAt: '',
  updatedAt: '',
};

const darkTheme: Theme = {
  ...lightTheme,
  id: 'theme-dark',
  name: 'dark',
  label: 'Dark',
  colors: {
    pageBg: '#020617',
    pageBgAccent: 'rgba(148, 163, 184, 0.08)',
    surface: '#0f172a',
    surfaceElevated: '#111827',
    surfaceMuted: '#1e293b',
    surfaceAlt: '#0b1120',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#334155',
    borderStrong: '#475569',
    primary: '#818cf8',
    primaryStrong: '#6366f1',
    accentSoft: 'rgba(99, 102, 241, 0.2)',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    shadow: '0 18px 40px rgba(2, 6, 23, 0.45)',
  },
  kindColors: {
    spell: '#c084fc',
    webLink: '#60a5fa',
    markdown: '#fbbf24',
    file: '#2dd4bf',
  },
  isDefault: false,
};

function timestamped(theme: Theme, isDefault: boolean): StoredTheme {
  const now = new Date().toISOString();
  return {
    ...theme,
    id: theme.id || randomUUID(),
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildSeedThemes(): StoredTheme[] {
  return [
    timestamped({ ...lightTheme }, true),
    timestamped({ ...darkTheme }, false),
  ];
}