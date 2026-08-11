import {
  authenticatedUserProfileSchema,
  authenticatedUserSchema,
  roleSchema,
  themeInputSchema,
  themeSchema,
} from '@conjuros/contracts';
import { describe, expect, it } from 'vitest';

export const validThemeDraft = {
  name: 'custom',
  label: 'Custom',
  colors: {
    pageBg: '#ffffff',
    pageBgAccent: 'rgba(0, 0, 0, 0.04)',
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
  iconAssets: {
    spell: { path: 'M15 4V2 M15 16v-2 M3 21l9-9', viewBox: '0 0 24 24' },
    copy: { path: 'M10 8 H20 A2 2 0 0 1 22 10 V20 A2 2 0 0 1 20 22 H10 A2 2 0 0 1 8 20 V10 A2 2 0 0 1 10 8 Z', viewBox: '0 0 24 24' },
    view: { path: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z', viewBox: '0 0 24 24' },
  },
  kindColors: {
    spell: '#7c3aed',
    webLink: '#2563eb',
    markdown: '#b45309',
    file: '#0d9488',
  },
  tagColorPalette: ['#1A73E8', '#7C3AED', '#2563EB', '#B45309', '#0D9488'],
};

export function validStoredTheme() {
  return {
    id: 'theme-custom',
    ...validThemeDraft,
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('theme contracts', () => {
  it('accepts a valid stored theme', () => {
    const parsed = themeSchema.parse(validStoredTheme());
    expect(parsed.name).toBe('custom');
  });

  it('rejects a color that is not hex-format', () => {
    const draft = { ...validThemeDraft, colors: { ...validThemeDraft.colors, primary: 'not-a-color' } };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an invalid font size token', () => {
    const draft = {
      ...validThemeDraft,
      fontSizes: { ...validThemeDraft.fontSizes, heading: 'huge' },
    };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an unknown icon asset key', () => {
    const draft = {
      ...validThemeDraft,
      iconAssets: {
        spell: { path: 'M15 4V2 M15 16v-2 M3 21l9-9', viewBox: '0 0 24 24' },
        'not-an-icon': { path: 'M0 0', viewBox: '0 0 24 24' },
      },
    };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an icon asset definition missing a path', () => {
    const draft = {
      ...validThemeDraft,
      iconAssets: { spell: { path: '', viewBox: '0 0 24 24' } },
    };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an icon asset definition missing a viewBox', () => {
    const draft = {
      ...validThemeDraft,
      iconAssets: { spell: { path: 'M0 0', viewBox: '' } },
    };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an empty icon assets record', () => {
    const draft = { ...validThemeDraft, iconAssets: {} };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects a tag color palette above the allowed bound', () => {
    const draft = {
      ...validThemeDraft,
      tagColorPalette: Array.from({ length: 25 }, (_, index) => `#${String(index).padStart(6, '0')}`),
    };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });

  it('normalizes the tag color palette to uppercase and deduplicates', () => {
    const parsed = themeInputSchema.parse({
      ...validThemeDraft,
      tagColorPalette: ['#123abc', '#123ABC', '#456DEF'],
    });
    expect(parsed.tagColorPalette).toEqual(['#123ABC', '#456DEF']);
  });

  it('requires at least one tag palette color', () => {
    const draft = { ...validThemeDraft, tagColorPalette: [] };
    expect(themeInputSchema.safeParse(draft).success).toBe(false);
  });
});

describe('role contracts', () => {
  it('accepts only user or admin roles', () => {
    expect(roleSchema.parse('user')).toBe('user');
    expect(roleSchema.parse('admin')).toBe('admin');
    expect(roleSchema.safeParse('owner').success).toBe(false);
  });

  it('keeps the session user free of persistence fields', () => {
    expect(authenticatedUserSchema.parse({ id: 'id-1', email: 'a@b.com' })).toEqual({
      id: 'id-1',
      email: 'a@b.com',
    });
  });

  it('exposes role on the authenticated profile', () => {
    expect(
      authenticatedUserProfileSchema.parse({
        id: 'id-1',
        email: 'a@b.com',
        theme: 'dark',
        role: 'admin',
      }),
    ).toEqual({ id: 'id-1', email: 'a@b.com', theme: 'dark', role: 'admin' });
  });
});