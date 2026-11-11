import { randomUUID } from 'node:crypto';
import {
  iconAssetKeySchema,
  iconAssetKeys,
  imageBackdropRequiresImageMessage,
  normalizeTagColor,
  themeIdSchema,
  themeImageExtensions,
  themeImageMaxBytes,
  themeImageMimeTypes,
  themeInputSchema,
  themeQuerySchema,
  themeSchema,
  themeUpdateSchema,
  type IconAssetKey,
  type SiteThemeContext,
  type Theme,
  type ThemeInput,
  type ThemeQuery,
  type ThemeUpdate,
} from '@conjuros/contracts';
import { ICON_ASSETS } from '../../web/lib/iconAssets';
import { AppError } from '../errors';
import type { StoredTheme, ThemesRepository } from '../repositories/themes.repository';
import { buildSeedThemes } from '../repositories/themeSeed';
import type { UserPreferencesRepository } from '../repositories/user-preferences.repository';
import { fileMatchesMimeType } from '../storage/fileSignature';
import type { ThemeImageStorage } from '../storage/themeImageStorage';
import type { UploadedFile } from './attachments.service';

function normalizeStoredTheme(theme: StoredTheme): StoredTheme {
  // Keyed record: migrate superseded bundled artwork, else pass through unchanged.
  if (!Array.isArray(theme.iconAssets)) {
    let iconAssets = theme.iconAssets;
    let changed = false;
    if (isSupersededSettings(iconAssets.settings)) {
      iconAssets = {
        ...iconAssets,
        settings: {
          path: ICON_ASSETS.settings.path,
          viewBox: ICON_ASSETS.settings.viewBox,
        },
      };
      changed = true;
    }
    const clear = iconAssets.clear;
    if (clear?.path !== undefined && SUPERSEDED_CLEAR_PATHS.has(clear.path)) {
      iconAssets = {
        ...iconAssets,
        clear: { path: ICON_ASSETS.clear.path, viewBox: ICON_ASSETS.clear.viewBox },
      };
      changed = true;
    }
    if (isSupersededAttachment(iconAssets.attachment)) {
      iconAssets = {
        ...iconAssets,
        attachment: {
          path: ICON_ASSETS.attachment.path,
          viewBox: ICON_ASSETS.attachment.viewBox,
        },
      };
      changed = true;
    }
    if (isSupersededTagsToggle(iconAssets.collapse)) {
      iconAssets = {
        ...iconAssets,
        collapse: { path: ICON_ASSETS.collapse.path, viewBox: ICON_ASSETS.collapse.viewBox },
      };
      changed = true;
    }
    if (isSupersededTagsToggle(iconAssets.expand)) {
      iconAssets = {
        ...iconAssets,
        expand: { path: ICON_ASSETS.expand.path, viewBox: ICON_ASSETS.expand.viewBox },
      };
      changed = true;
    }
    return changed ? { ...theme, iconAssets } : theme;
  }
  // Legacy `string[]` (from `theme-svg-sprite-icons`): convert to a keyed record
  // by merging each entry's `{ path, viewBox }` from `ICON_ASSETS`.
  const record: StoredTheme['iconAssets'] = {} as StoredTheme['iconAssets'];
  for (const candidate of theme.iconAssets) {
    const parsed = iconAssetKeySchema.safeParse(candidate);
    if (!parsed.success) continue;
    const fallback = ICON_ASSETS[parsed.data];
    if (!fallback) continue;
    (record as Record<string, { path: string; viewBox: string }>)[parsed.data] = {
      path: fallback.path,
      viewBox: fallback.viewBox,
    };
  }
  if (Object.keys(record).length === 0) return theme;
  return { ...theme, iconAssets: record };
}

function sameIconAssets(
  left: Theme['iconAssets'],
  right: Theme['iconAssets'],
): boolean {
  const leftRecord = left as Record<string, { path: string; viewBox: string }>;
  const rightRecord = right as Record<string, { path: string; viewBox: string }>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);
  if (leftKeys.length !== rightKeys.length) return false;
  for (const key of leftKeys) {
    const a = leftRecord[key];
    const b = rightRecord[key];
    if (!a || !b) return false;
    if (a.path !== b.path || a.viewBox !== b.viewBox) return false;
  }
  return true;
}

// Previous bundled `clear` artwork variants (outline redrawing, the 960-grid
// verbatim path, and the rescaled 24-grid path), all superseded by the current
// clear artwork. A stored entry exactly matching any of them is treated as a
// shipped default and migrated; any other stored value is an admin customization
// and is preserved.
const SUPERSEDED_CLEAR_PATHS = new Set([
  'M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5z M17.5 8.5l3 3 M20.5 8.5l-3 3',
  'm476-420 84-84 84 84 56-56-84-84 84-84-56-56-84 84-84-84-56 56 84 84-84 84 56 56ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z',
  'm11.9 13.5l2.1 -2.1l2.1 2.1l1.4 -1.4l-2.1 -2.1l2.1 -2.1l-1.4 -1.4l-2.1 2.1l-2.1 -2.1l-1.4 1.4l2.1 2.1l-2.1 2.1l1.4 1.4ZM8 18q-0.82 0 -1.41 -0.59T6 16v-12q0 -0.82 0.59 -1.41T8 2h12q0.83 0 1.41 0.59T22 4v12q0 0.83 -0.59 1.41T20 18H8Zm0 -2h12v-12H8v12ZM4 22q-0.82 0 -1.41 -0.59T2 20v-14h2v14h14v2H4Zm4 -18v12v-12Z',
]);

// Previous bundled `attachment` artwork on Material's 960-unit grid, superseded by
// the 24-grid outline path. A stored entry exactly matching it is treated as a
// shipped default and migrated; any other stored value is an admin customization.
const SUPERSEDED_ATTACHMENT_ARTWORK = {
  path: 'M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z',
  viewBox: '0 -960 960 960',
};

function isSupersededAttachment(
  value: { path: string; viewBox: string } | undefined,
): boolean {
  return (
    value?.path === SUPERSEDED_ATTACHMENT_ARTWORK.path &&
    value.viewBox === SUPERSEDED_ATTACHMENT_ARTWORK.viewBox
  );
}

// The tags bookmark was briefly shipped as the `collapse`/`expand` artwork.
// Stored entries still carrying it are restored to the chevrons; any other
// value is an admin customization and is preserved.
const SUPERSEDED_TAGS_TOGGLE_ARTWORK = {
  path: 'M 3 2.25 C 1.88 2.25 1.88 4.13 3 4.13 H 4.88 V 20.25 C 4.88 21 5.25 21.38 6 21 L 12 16.5 L 18 21 C 18.75 21.38 19.13 21 19.13 20.25 V 4.13 H 21 C 22.13 4.13 22.13 2.25 21 2.25 Z',
  viewBox: '0 0 24 24',
};

function isSupersededTagsToggle(
  value: { path: string; viewBox: string } | undefined,
): boolean {
  return (
    value?.path === SUPERSEDED_TAGS_TOGGLE_ARTWORK.path &&
    value.viewBox === SUPERSEDED_TAGS_TOGGLE_ARTWORK.viewBox
  );
}

const SUPERSEDED_SETTINGS_ARTWORK = {
  path: 'm421-132-15-111q-23-7-51-22.5T308-299l-102 46-59-105 90-67q-2-13-3.5-27t-1.5-27q0-12 1.5-26t3.5-30l-90-68 59-102 101 44q22-18 48-33t50-22l16-112h118l15 112q27 10 50 23t45 32l106-44 58 102-94 70q4 15 5 28t1 25q0 11-1.5 24t-4.5 30l93 68-59 105-104-47q-23 20-46.5 34.5T554-244l-15 112H421Zm18-22h81l15-111q30-8 54.5-22t51.5-39l102 44 40-69-90-67q4-19 6-33.5t2-28.5q0-16-2-29.5t-6-30.5l92-69-40-69-105 44q-18-20-49-39t-57-22l-13-111h-82l-12 110q-32 6-57.5 20.5T318-635l-103-43-40 69 90 66q-5 14-7 30t-2 34q0 16 2 31t6 30l-89 67 40 69 102-43q24 25 50 39t59 22l13 110Zm38-241q36 0 60.5-24.5T562-480q0-36-24.5-60.5T477-565q-35 0-60 24.5T392-480q0 36 25 60.5t60 24.5Zm3-85Z',
  viewBox: '0 -960 960 960',
};

function isSupersededSettings(
  value: { path: string; viewBox: string } | undefined,
): boolean {
  return (
    value?.path === SUPERSEDED_SETTINGS_ARTWORK.path &&
    value.viewBox === SUPERSEDED_SETTINGS_ARTWORK.viewBox
  );
}

function buildIconAssetsRecord(
  current: Theme['iconAssets'],
): Record<IconAssetKey, { path: string; viewBox: string }> {
  const record = {} as Record<IconAssetKey, { path: string; viewBox: string }>;
  // Preserve existing entries (admin customizations win).
  if (!Array.isArray(current)) {
    for (const [key, value] of Object.entries(current)) {
      const parsed = iconAssetKeySchema.safeParse(key);
      if (!parsed.success) continue;
      if (!value || typeof value.path !== 'string' || typeof value.viewBox !== 'string') continue;
      record[parsed.data] = { path: value.path, viewBox: value.viewBox };
    }
  } else {
    // Legacy array path: derive from `ICON_ASSETS`.
    for (const candidate of current) {
      const parsed = iconAssetKeySchema.safeParse(candidate);
      if (!parsed.success) continue;
      const fallback = ICON_ASSETS[parsed.data];
      if (!fallback) continue;
      record[parsed.data] = { path: fallback.path, viewBox: fallback.viewBox };
    }
  }
  // Fill missing keys from `ICON_ASSETS`.
  for (const key of iconAssetKeys) {
    if (record[key]) continue;
    const fallback = ICON_ASSETS[key];
    if (!fallback) continue;
    record[key] = { path: fallback.path, viewBox: fallback.viewBox };
  }
  // Migrate the superseded bundled `settings` artwork; custom values are preserved.
  if (isSupersededSettings(record.settings)) {
    record.settings = {
      path: ICON_ASSETS.settings.path,
      viewBox: ICON_ASSETS.settings.viewBox,
    };
  }
  // Migrate the superseded bundled `clear` artwork; custom values are preserved.
  if (record.clear?.path !== undefined && SUPERSEDED_CLEAR_PATHS.has(record.clear.path)) {
    record.clear = { path: ICON_ASSETS.clear.path, viewBox: ICON_ASSETS.clear.viewBox };
  }
  // Migrate the superseded bundled `attachment` artwork; custom values are preserved.
  if (isSupersededAttachment(record.attachment)) {
    record.attachment = {
      path: ICON_ASSETS.attachment.path,
      viewBox: ICON_ASSETS.attachment.viewBox,
    };
  }
  // Restore collapse/expand chevrons from the briefly shipped tags artwork.
  if (isSupersededTagsToggle(record.collapse)) {
    record.collapse = {
      path: ICON_ASSETS.collapse.path,
      viewBox: ICON_ASSETS.collapse.viewBox,
    };
  }
  if (isSupersededTagsToggle(record.expand)) {
    record.expand = {
      path: ICON_ASSETS.expand.path,
      viewBox: ICON_ASSETS.expand.viewBox,
    };
  }
  return record;
}

function isThemeImageMimeType(value: string): value is (typeof themeImageMimeTypes)[number] {
  return (themeImageMimeTypes as readonly string[]).includes(value);
}

export class ThemesService {
  constructor(
    private readonly themes: ThemesRepository,
    private readonly preferences: UserPreferencesRepository,
    private readonly themeImages: ThemeImageStorage | null = null,
  ) {}

  private toPublic(theme: StoredTheme): Theme {
    const normalized = normalizeStoredTheme(theme);
    const imageBackdropUrl =
      normalized.imageBackdrop && this.themeImages
        ? this.themeImages.publicUrl(normalized.imageBackdrop.storagePath)
        : undefined;
    return themeSchema.parse({
      ...normalized,
      iconAssets: buildIconAssetsRecord(normalized.iconAssets),
      imageBackdropUrl,
    });
  }

  parseQuery(input: unknown): ThemeQuery {
    return themeQuerySchema.parse(input);
  }

  parseInput(input: unknown): ThemeInput {
    return themeInputSchema.parse(input);
  }

  parseUpdate(input: unknown): ThemeUpdate {
    return themeUpdateSchema.parse(input);
  }

  parseId(input: unknown): string {
    return themeIdSchema.parse(input);
  }

  async ensureSeeded(): Promise<void> {
    if ((await this.themes.count()) > 0) return;
    for (const seed of buildSeedThemes()) {
      await this.themes.create(seed);
    }
  }

  async backfillIconAssets(): Promise<void> {
    const total = await this.themes.count();
    if (total === 0) return;

    const stored = await this.themes.findAll();
    for (const theme of stored) {
      const normalized = normalizeStoredTheme(theme);
      const merged = buildIconAssetsRecord(normalized.iconAssets);
      // Compare against the raw stored value (not the normalized copy) so that
      // read-time migrations (e.g. the superseded `clear` artwork) are persisted.
      if (!Array.isArray(theme.iconAssets) && sameIconAssets(merged, theme.iconAssets)) continue;
      await this.themes.replace({
        ...theme,
        iconAssets: merged,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async list(query: ThemeQuery) {
    const result = await this.themes.list(query);
    return { items: result.items.map((theme) => this.toPublic(theme)), total: result.total };
  }

  async get(id: string) {
    const theme = await this.themes.findById(id);
    if (!theme) throw new AppError(404, 'NOT_FOUND', 'Theme not found');
    return this.toPublic(theme);
  }

  async create(input: ThemeInput) {
    if (await this.themes.findByName(input.name)) {
      throw new AppError(409, 'CONFLICT', 'A theme with this name already exists');
    }
    const timestamp = new Date().toISOString();
    const theme: StoredTheme = {
      id: randomUUID(),
      ...input,
      imageBackdrop: null,
      tagColorPalette: input.tagColorPalette.map(normalizeTagColor),
      isDefault: input.isDefault,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    if (theme.isDefault) {
      const currentDefault = await this.themes.findDefault();
      if (currentDefault && currentDefault.id !== theme.id) {
        await this.themes.replace({ ...currentDefault, isDefault: false, updatedAt: timestamp });
      }
    }
    const created = await this.themes.create(theme);
    return this.toPublic(created);
  }

  async update(id: string, update: ThemeUpdate) {
    const current = await this.requireTheme(id);
    if (update.name !== undefined && update.name !== current.name) {
      const existing = await this.themes.findByName(update.name);
      if (existing && existing.id !== id) {
        throw new AppError(409, 'CONFLICT', 'A theme with this name already exists');
      }
    }
    const merged: StoredTheme = {
      ...current,
      ...update,
      tagColorPalette: (update.tagColorPalette ?? current.tagColorPalette).map(normalizeTagColor),
      updatedAt: new Date().toISOString(),
    };
    if (merged.useImageBackdrop && !merged.imageBackdrop) {
      throw new AppError(400, 'VALIDATION_ERROR', imageBackdropRequiresImageMessage);
    }
    if (merged.isDefault && !current.isDefault) {
      const currentDefault = await this.themes.findDefault();
      if (currentDefault && currentDefault.id !== id) {
        await this.themes.replace({ ...currentDefault, isDefault: false, updatedAt: merged.updatedAt });
      }
    }
    const updated = await this.themes.replace(merged);
    return this.toPublic(updated);
  }

  assertImageStorageConfigured(): ThemeImageStorage {
    if (!this.themeImages) {
      throw new AppError(503, 'STORAGE_NOT_CONFIGURED', 'File storage is not configured on this server');
    }
    return this.themeImages;
  }

  async uploadImageBackdrop(id: string, file: UploadedFile | undefined): Promise<Theme> {
    const storage = this.assertImageStorageConfigured();
    const current = await this.requireTheme(id);
    if (!file || file.buffer.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A non-empty image file is required');
    }
    if (file.buffer.length > themeImageMaxBytes) {
      throw new AppError(413, 'FILE_TOO_LARGE', 'The image exceeds the maximum allowed size');
    }
    if (!isThemeImageMimeType(file.mimetype) || !fileMatchesMimeType(file.buffer, file.mimetype)) {
      throw new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'This image type is not supported');
    }

    const storagePath = `themes/${id}/${randomUUID()}.${themeImageExtensions[file.mimetype]}`;
    await storage.upload(storagePath, file.buffer, file.mimetype);
    const updated = await this.themes.replace({
      ...current,
      imageBackdrop: { storagePath, mimeType: file.mimetype, sizeBytes: file.buffer.length },
      updatedAt: new Date().toISOString(),
    });
    return this.toPublic(updated);
  }

  async delete(id: string) {
    const theme = await this.requireTheme(id);
    if (theme.isDefault) {
      throw new AppError(409, 'CONFLICT', 'The default theme cannot be deleted');
    }
    if (!(await this.themes.delete(id))) {
      throw new AppError(404, 'NOT_FOUND', 'Theme not found');
    }
  }

  async setActive(id: string) {
    const updated = await this.themes.setDefault(id);
    if (!updated) throw new AppError(404, 'NOT_FOUND', 'Theme not found');
    return this.toPublic(updated);
  }

  async getActiveForUser(userId: string): Promise<SiteThemeContext> {
    const { themeId } = await this.preferences.get(userId);
    const selected = themeId ? await this.themes.findById(themeId) : null;
    if (selected) return { theme: this.toPublic(selected), source: 'preference' };
    const fallback = (await this.themes.findDefault()) ?? (await this.themes.findAll())[0] ?? null;
    if (!fallback) throw new AppError(404, 'NOT_FOUND', 'No theme is available');
    return { theme: this.toPublic(fallback), source: 'default' };
  }

  async getActivePaletteForUser(userId: string): Promise<string[] | null> {
    const { themeId } = await this.preferences.get(userId);
    const selected = themeId ? await this.themes.findById(themeId) : null;
    const active = selected ?? (await this.themes.findDefault()) ?? (await this.themes.findAll())[0] ?? null;
    return active ? active.tagColorPalette : null;
  }

  async assertTagColorInPalette(userId: string, color: string): Promise<void> {
    const palette = await this.getActivePaletteForUser(userId);
    if (!palette) return;
    const normalized = normalizeTagColor(color);
    if (!palette.some((entry) => normalizeTagColor(entry) === normalized)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Tag color must be part of the active theme palette');
    }
  }

  private async requireTheme(id: string) {
    const theme = await this.themes.findById(id);
    if (!theme) throw new AppError(404, 'NOT_FOUND', 'Theme not found');
    return theme;
  }
}