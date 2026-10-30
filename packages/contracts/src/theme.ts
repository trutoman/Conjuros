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

export const backdropPatternValues = ['lines', 'grid', 'dots', 'none'] as const;
export const backdropGlowPositionValues = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export const backdropPatternSchema = z.enum(backdropPatternValues);
export const backdropGlowPositionSchema = z.enum(backdropGlowPositionValues);
export const pixelTokenSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?px$/, 'Size must use the px unit');
export const percentTokenSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?%$/, 'Size must use the % unit');

export const themeBackdropSchema = z.object({
  pattern: backdropPatternSchema,
  gridSize: pixelTokenSchema,
  lineWidth: pixelTokenSchema,
  glowPosition: backdropGlowPositionSchema,
  glowSize: percentTokenSchema,
  glowColor: cssColorValueSchema,
});

export const themeKindColorsSchema = z.object({
  command: hexColorTokenSchema,
  webLink: hexColorTokenSchema,
  markdown: hexColorTokenSchema,
  file: hexColorTokenSchema,
  attachment: hexColorTokenSchema,
});

export const iconAssetKeys = [
  'command',
  'web-link',
  'markdown',
  'file',
  'attachment',
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
  'clear',
  'search',
  'sun',
  'moon',
  'add',
] as const;

export const iconAssetKeySchema = z.enum(iconAssetKeys);

export const iconAssetDefinitionSchema = z.object({
  path: z.string().trim().min(1).max(8_000),
  viewBox: z.string().trim().min(1).max(64),
});

export const iconAssetsSchema = z
  .record(iconAssetKeySchema, iconAssetDefinitionSchema)
  .refine(
    (record) => Object.keys(record).length > 0,
    'A theme must define at least one icon asset',
  );

export const tagColorPaletteSchema = z
  .array(hexColorTokenSchema)
  .min(1, 'A theme must define at least one tag color')
  .max(24, 'The tag color palette may contain at most 24 colors')
  .transform((colors) => [...new Set(colors.map((color) => color.toUpperCase()))]);

export const themeImageMimeTypes = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const themeImageMaxBytes = 5 * 1024 * 1024;
export const themeImageExtensions: Record<(typeof themeImageMimeTypes)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const themeImageBackdropSchema = z.object({
  storagePath: z.string().trim().min(1).max(512),
  mimeType: z.enum(themeImageMimeTypes),
  sizeBytes: z.number().int().positive().max(themeImageMaxBytes),
});

export const imageBackdropRequiresImageMessage =
  'Image backdrop mode requires an uploaded image; save the theme in backdrop mode first';

// Form drafts and stored themes share these fields. The image reference is not part of
// the draft: only the image upload endpoint writes it, so clients cannot choose a storage path.
export const themeDraftSchema = z.object({
  name: themeNameSchema,
  label: themeLabelSchema,
  colors: themeColorsSchema,
  fonts: themeFontsSchema,
  fontSizes: themeFontSizesSchema,
  backdrop: themeBackdropSchema,
  useImageBackdrop: z.boolean().default(false),
  iconAssets: iconAssetsSchema,
  kindColors: themeKindColorsSchema,
  tagColorPalette: tagColorPaletteSchema,
  isDefault: z.boolean().default(false),
});

export const themeInputSchema = themeDraftSchema.superRefine((value, context) => {
  if (value.useImageBackdrop) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['useImageBackdrop'],
      message: imageBackdropRequiresImageMessage,
    });
  }
});

export const themeUpdateSchema = themeDraftSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

export const themeSchema = themeDraftSchema
  .extend({
    id: themeIdSchema,
    imageBackdrop: themeImageBackdropSchema.nullable().default(null),
    imageBackdropUrl: z.string().url().optional(),
    isDefault: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((value, context) => {
    if (value.useImageBackdrop && !value.imageBackdrop) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageBackdrop'],
        message: imageBackdropRequiresImageMessage,
      });
    }
  });

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
export type ThemeBackdrop = z.infer<typeof themeBackdropSchema>;
export type ThemeImageBackdrop = z.infer<typeof themeImageBackdropSchema>;
export type ThemeKindColors = z.infer<typeof themeKindColorsSchema>;
export type IconAssetKey = z.infer<typeof iconAssetKeySchema>;
export type IconAssetDefinition = z.infer<typeof iconAssetDefinitionSchema>;
export type IconAssets = z.infer<typeof iconAssetsSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type ThemeInput = z.infer<typeof themeInputSchema>;
export type ThemeUpdate = z.infer<typeof themeUpdateSchema>;
export type ThemeQuery = z.infer<typeof themeQuerySchema>;
export type ThemeListResult = z.infer<typeof themeListSchema>;
export type SiteThemeContext = z.infer<typeof siteThemeContextSchema>;
export type SiteThemeSource = z.infer<typeof siteThemeSourceSchema>;