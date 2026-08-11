import { randomUUID } from 'node:crypto';
import {
  iconAssetKeySchema,
  iconAssetKeys,
  normalizeTagColor,
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
import type { UsersRepository } from '../repositories/users.repository';

function normalizeStoredTheme(theme: StoredTheme): StoredTheme {
  // Keyed record: pass through unchanged.
  if (!Array.isArray(theme.iconAssets)) {
    return theme;
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

function publicTheme(theme: StoredTheme): Theme {
  return themeSchema.parse(normalizeStoredTheme(theme));
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
  return record;
}

export class ThemesService {
  constructor(
    private readonly themes: ThemesRepository,
    private readonly users: UsersRepository,
  ) {}

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
    return themeSchema.shape.id.parse(input);
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
      if (sameIconAssets(merged, normalized.iconAssets)) continue;
      await this.themes.replace({
        ...theme,
        iconAssets: merged,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async list(query: ThemeQuery) {
    const result = await this.themes.list(query);
    return { items: result.items.map(publicTheme), total: result.total };
  }

  async get(id: string) {
    const theme = await this.themes.findById(id);
    if (!theme) throw new AppError(404, 'NOT_FOUND', 'Theme not found');
    return publicTheme(theme);
  }

  async create(input: ThemeInput) {
    if (await this.themes.findByName(input.name)) {
      throw new AppError(409, 'CONFLICT', 'A theme with this name already exists');
    }
    const timestamp = new Date().toISOString();
    const theme: StoredTheme = {
      id: randomUUID(),
      ...input,
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
    return publicTheme(created);
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
    if (merged.isDefault && !current.isDefault) {
      const currentDefault = await this.themes.findDefault();
      if (currentDefault && currentDefault.id !== id) {
        await this.themes.replace({ ...currentDefault, isDefault: false, updatedAt: merged.updatedAt });
      }
    }
    const updated = await this.themes.replace(merged);
    return publicTheme(updated);
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
    return publicTheme(updated);
  }

  async getActiveForUser(userId: string): Promise<SiteThemeContext> {
    const user = await this.users.findById(userId);
    const preference = user?.theme ?? 'light';
    const byPreference = await this.themes.findByName(preference);
    if (byPreference) return { theme: publicTheme(byPreference), source: 'preference' };
    const fallback = (await this.themes.findDefault()) ?? (await this.themes.findAll())[0] ?? null;
    if (!fallback) throw new AppError(404, 'NOT_FOUND', 'No theme is available');
    return { theme: publicTheme(fallback), source: 'default' };
  }

  async getActivePaletteForUser(userId: string): Promise<string[] | null> {
    const user = await this.users.findById(userId);
    const preference = user?.theme ?? 'light';
    const byPreference = await this.themes.findByName(preference);
    const active = byPreference ?? (await this.themes.findDefault()) ?? (await this.themes.findAll())[0] ?? null;
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