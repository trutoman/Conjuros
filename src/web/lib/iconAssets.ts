import type { IconAssetKey } from '@conjuros/contracts';

export const ICON_ASSETS: Record<IconAssetKey, { path: string; viewBox: string }> = {
  spell: {
    path: 'M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8 L19 13 M17.8 6.2 L19 5 M3 21l9-9 M12.2 6.2 L11 5',
    viewBox: '0 0 24 24',
  },
  'web-link': {
    path: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    viewBox: '0 0 24 24',
  },
  markdown: {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    viewBox: '0 0 24 24',
  },
  file: {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    viewBox: '0 0 24 24',
  },
  copy: {
    path: 'M10 8 H20 A2 2 0 0 1 22 10 V20 A2 2 0 0 1 20 22 H10 A2 2 0 0 1 8 20 V10 A2 2 0 0 1 10 8 Z M4 16 C2.9 16 2 15.1 2 14 V4 C2 2.9 2.9 2 4 2 H14 C15.1 2 16 2.9 16 4',
    viewBox: '0 0 24 24',
  },
  open: {
    path: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 L21 3',
    viewBox: '0 0 24 24',
  },
  view: {
    path: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z',
    viewBox: '0 0 24 24',
  },
  download: {
    path: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    viewBox: '0 0 24 24',
  },
  menu: {
    path: 'M12 5a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 17a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z',
    viewBox: '0 0 24 24',
  },
  edit: {
    path: 'M12 20h9 M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
    viewBox: '0 0 24 24',
  },
  delete: {
    path: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
    viewBox: '0 0 24 24',
  },
  confirm: {
    path: 'M20 6 9 17l-5-5',
    viewBox: '0 0 24 24',
  },
  cancel: {
    path: 'M18 6 6 18 M6 6l12 12',
    viewBox: '0 0 24 24',
  },
  expand: {
    path: 'M6 9l6 6 6-6',
    viewBox: '0 0 24 24',
  },
  collapse: {
    path: 'M18 15l-6-6-6 6',
    viewBox: '0 0 24 24',
  },
  close: {
    path: 'M18 6 6 18 M6 6l12 12',
    viewBox: '0 0 24 24',
  },
  search: {
    path: 'M11 3a8 8 0 1 0 0 16 8 8 0 1 0 0-16Z M21 21l-4.3-4.3',
    viewBox: '0 0 24 24',
  },
};

export const THEME_MANAGEMENT_ICONS: Record<string, { path: string; viewBox: string }> = {
  palette: {
    path: 'M12 22a10 10 0 1 1 10-10c0 2.2-1.8 4-4 4h-2.5a1.5 1.5 0 0 0-1.15 2.45 1.5 1.5 0 0 1-1.15 2.55H12Z M6 12a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z M9 7a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z M15 7a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z M18 11a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z',
    viewBox: '0 0 24 24',
  },
};