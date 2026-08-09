import { z } from 'zod';
import { hexColorPattern } from './tags';

export const themeIdSchema = z.string().min(1).max(128);
export const themeNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9_-]+$/i, 'Theme name must use only letters, numbers, dashes, and underscores');
export const themeLabelSchema = z.string().trim().min(1).max(120);
export const hexColorTokenSchema = z
  .string()
  .trim()
  .regex(hexColorPattern, 'Color must use the #RRGGBB format');
export const cssColorValueSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(
    /^(#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})|(?:rgba?|hsla?)\([^)]*\)|color-mix\([^)]*\)|(?:var|calc)\([^)]*\)|transparent|currentColor)$/,
    'Color value must be a valid CSS color',
  );
export const shadowTokenSchema = z.string().trim().min(1).max(200);
export const fontStackSchema = z.string().trim().min(1).max(200);
export const fontSizeTokenSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Font size must use px, rem, or em units');

export const themeColorsSchema = z.object({
  pageBg: hexColorTokenSchema,
  pageBgAccent: cssColorValueSchema,
  surface: hexColorTokenSchema,
  surfaceElevated: hexColorTokenSchema,
  surfaceMuted: hexColorTokenSchema,
  surfaceAlt: hexColorTokenSchema,
  text: hexColorTokenSchema,
  textMuted: hexColorTokenSchema,
  border: hexColorTokenSchema,
  borderStrong: hexColorTokenSchema,
  primary: hexColorTokenSchema,
  primaryStrong: hexColorTokenSchema,
  accentSoft: cssColorValueSchema,
  danger: hexColorTokenSchema,
  success: hexColorTokenSchema,
  warning: hexColorTokenSchema,
  shadow: shadowTokenSchema,
});

export const themeFontsSchema = z.object({
  display: fontStackSchema,
  body: fontStackSchema,
  mono: fontStackSchema,
});

export const themeFontSizesSchema = z.object({
  heading: fontSizeTokenSchema,
  body: fontSizeTokenSchema,
  mono: fontSizeTokenSchema,
});

export const themeKindColorsSchema = z.object({
  spell: hexColorTokenSchema,
  webLink: hexColorTokenSchema,
  markdown: hexColorTokenSchema,
  file: hexColorTokenSchema,
});

export const iconAssetKeys = [
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
  'close',
  'search',
] as const;

export const iconAssetKeySchema = z.enum(iconAssetKeys);

export const tagColorPaletteSchema = z
  .array(hexColorTokenSchema)
  .min(1, 'A theme must define at least one tag color')
  .max(24, 'The tag color palette may contain at most 24 colors')
  .transform((colors) => [...new Set(colors.map((color) => color.toUpperCase()))]);

export const themeSchema = z.object({
  id: themeIdSchema,
  name: themeNameSchema,
  label: themeLabelSchema,
  colors: themeColorsSchema,
  fonts: themeFontsSchema,
  fontSizes: themeFontSizesSchema,
  iconAssets: z.array(iconAssetKeySchema).max(iconAssetKeys.length),
  kindColors: themeKindColorsSchema,
  tagColorPalette: tagColorPaletteSchema,
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const themeInputSchema = themeSchema
  .omit({ id: true, isDefault: true, createdAt: true, updatedAt: true })
  .extend({ isDefault: z.boolean().default(false) });

export const themeUpdateSchema = themeInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

export const themeQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(25),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(['name', 'label', 'updatedAt']).default('name'),
});

export const themeListSchema = z.object({
  items: z.array(themeSchema),
  total: z.number().int().min(0),
});

export const siteThemeSourceSchema = z.enum(['preference', 'default', 'fallback']);

export const siteThemeContextSchema = z.object({
  theme: themeSchema,
  source: siteThemeSourceSchema,
});

export function normalizeTagColor(color: string): string {
  return color.trim().toUpperCase();
}

export type ThemeColors = z.infer<typeof themeColorsSchema>;
export type ThemeFonts = z.infer<typeof themeFontsSchema>;
export type ThemeFontSizes = z.infer<typeof themeFontSizesSchema>;
export type ThemeKindColors = z.infer<typeof themeKindColorsSchema>;
export type IconAssetKey = z.infer<typeof iconAssetKeySchema>;
export type Theme = z.infer<typeof themeSchema>;
export type ThemeInput = z.infer<typeof themeInputSchema>;
export type ThemeUpdate = z.infer<typeof themeUpdateSchema>;
export type ThemeQuery = z.infer<typeof themeQuerySchema>;
export type ThemeListResult = z.infer<typeof themeListSchema>;
export type SiteThemeContext = z.infer<typeof siteThemeContextSchema>;
export type SiteThemeSource = z.infer<typeof siteThemeSourceSchema>;