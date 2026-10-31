import { useState } from 'react';
import {
  backdropGlowPositionValues,
  backdropPatternValues,
  iconAssetKeys,
  themeDraftSchema,
  themeImageMaxBytes,
  themeImageMimeTypes,
  type IconAssetDefinition,
  type IconAssetKey,
  type Theme,
  type ThemeImageBackdrop,
  type ThemeInput,
} from '@conjuros/contracts';
import { ICON_ASSETS } from '../lib/iconAssets';
import { deriveThemeCopyIdentity } from '../lib/themeCopy';
import { uploadThemeImage } from '../services/themes';
import { ColorInput } from './ColorInput';
import { FormField } from './FormField';
import { ThemeIcon } from './ThemeIcon';

const colorFields = [
  'pageBg',
  'pageBgAccent',
  'surface',
  'surfaceElevated',
  'surfaceMuted',
  'surfaceAlt',
  'text',
  'textMuted',
  'border',
  'borderStrong',
  'primary',
  'primaryStrong',
  'accentSoft',
  'danger',
  'success',
  'warning',
  'shadow',
] as const;

const kindColorFields = ['command', 'webLink', 'markdown', 'file', 'attachment'] as const;

type ColorValues = Record<string, string>;

export function ThemeForm({
  theme,
  baseTheme,
  existingNames = [],
  onSubmit,
  onCancel,
}: {
  theme?: Theme;
  baseTheme?: Theme;
  existingNames?: string[];
  onSubmit: (input: ThemeInput) => Promise<unknown> | void;
  onCancel: () => void;
}) {
  const seed = theme ?? baseTheme;
  const copyIdentity = !theme && baseTheme ? deriveThemeCopyIdentity(baseTheme, existingNames) : null;
  const [name, setName] = useState(theme?.name ?? copyIdentity?.name ?? '');
  const [label, setLabel] = useState(theme?.label ?? copyIdentity?.label ?? '');
  const [isDefault, setIsDefault] = useState(theme?.isDefault ?? false);
  const [colors, setColors] = useState<ColorValues>(() => {
    const initial: ColorValues = {};
    for (const field of colorFields) {
      initial[field] = seed?.colors[field] ?? '';
    }
    return initial;
  });
  const [kindColors, setKindColors] = useState<ColorValues>(() => {
    const initial: ColorValues = {};
    for (const field of kindColorFields) {
      initial[field] = seed?.kindColors[field] ?? '';
    }
    return initial;
  });
  const [displayFont, setDisplayFont] = useState(seed?.fonts.display ?? '');
  const [bodyFont, setBodyFont] = useState(seed?.fonts.body ?? '');
  const [monoFont, setMonoFont] = useState(seed?.fonts.mono ?? '');
  const [headingSize, setHeadingSize] = useState(seed?.fontSizes.heading ?? '');
  const [bodySize, setBodySize] = useState(seed?.fontSizes.body ?? '');
  const [monoSize, setMonoSize] = useState(seed?.fontSizes.mono ?? '');
  const [backdrop, setBackdrop] = useState({
    pattern: seed?.backdrop.pattern ?? 'lines',
    gridSize: seed?.backdrop.gridSize ?? '',
    lineWidth: seed?.backdrop.lineWidth ?? '',
    glowPosition: seed?.backdrop.glowPosition ?? 'top-right',
    glowSize: seed?.backdrop.glowSize ?? '',
    glowColor: seed?.backdrop.glowColor ?? '',
  });
  const [iconAssets, setIconAssets] = useState<Record<IconAssetKey, IconAssetDefinition>>(() => {
    const initial = {} as Record<IconAssetKey, IconAssetDefinition>;
    for (const key of iconAssetKeys) {
      const stored = seed?.iconAssets?.[key];
      const fallback = ICON_ASSETS[key];
      initial[key] = stored ?? { path: fallback.path, viewBox: fallback.viewBox };
    }
    return initial;
  });
  const [palette, setPalette] = useState<string[]>(() => [...(seed?.tagColorPalette ?? [''])]);
  const [useImageBackdrop, setUseImageBackdrop] = useState(theme?.useImageBackdrop ?? false);
  const [storedImage, setStoredImage] = useState<ThemeImageBackdrop | null>(theme?.imageBackdrop ?? null);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');

  function setIconPath(key: IconAssetKey, value: string) {
    setIconAssets((prev) => ({ ...prev, [key]: { ...prev[key], path: value } }));
  }

  function setIconViewBox(key: IconAssetKey, value: string) {
    setIconAssets((prev) => ({ ...prev, [key]: { ...prev[key], viewBox: value } }));
  }

  function setPaletteColor(index: number, value: string) {
    setPalette((prev) => prev.map((entry, i) => (i === index ? value : entry)));
  }

  function addPaletteColor() {
    setPalette((prev) => [...prev, '#1A73E8']);
  }

  function removePaletteColor(index: number) {
    setPalette((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !theme) return;
    setImageError('');
    if (!(themeImageMimeTypes as readonly string[]).includes(file.type)) {
      setImageError('Use a PNG, JPEG, or WebP image');
      return;
    }
    if (file.size > themeImageMaxBytes) {
      setImageError('The image must be 5 MB or smaller');
      return;
    }
    try {
      const updated = await uploadThemeImage(theme.id, file);
      setStoredImage(updated.imageBackdrop);
    } catch (uploadError) {
      setImageError(uploadError instanceof Error ? uploadError.message : 'Could not upload the image');
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const result = themeDraftSchema.safeParse({
      name,
      label,
      colors,
      fonts: { display: displayFont, body: bodyFont, mono: monoFont },
      fontSizes: { heading: headingSize, body: bodySize, mono: monoSize },
      backdrop,
      useImageBackdrop,
      iconAssets,
      kindColors,
      tagColorPalette: palette.filter((entry) => entry.trim() !== ''),
      isDefault,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the theme details');
      return;
    }

    await onSubmit(result.data);
  }

  return (
    <form className="item-form theme-form" onSubmit={submit}>
      <button type="button" className="form-close" aria-label="Close theme form" onClick={onCancel}>
        <ThemeIcon name="close" />
      </button>
      <h2>{theme ? `Edit ${theme.label}` : 'Add theme'}</h2>
      <FormField label="Name" error={error}>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </FormField>
      <FormField label="Label">
        <input value={label} onChange={(event) => setLabel(event.target.value)} />
      </FormField>
      <FormField label="Make site default">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
      </FormField>

      <h3 className="theme-form-section">Colors</h3>
      <div className="theme-form-grid">
        {colorFields.map((field) => (
          <FormField key={field} label={field}>
            {field === 'shadow' ? (
              <input
                value={colors[field]}
                onChange={(event) => setColors((prev) => ({ ...prev, [field]: event.target.value }))}
              />
            ) : (
              <ColorInput
                value={colors[field]}
                onChange={(value) => setColors((prev) => ({ ...prev, [field]: value }))}
              />
            )}
          </FormField>
        ))}
      </div>

      <h3 className="theme-form-section">Item kind colors</h3>
      <div className="theme-form-grid">
        {kindColorFields.map((field) => (
          <FormField key={field} label={field}>
            <ColorInput
              value={kindColors[field]}
              onChange={(value) => setKindColors((prev) => ({ ...prev, [field]: value }))}
            />
          </FormField>
        ))}
      </div>

      <h3 className="theme-form-section">Fonts</h3>
      <FormField label="Display font">
        <input value={displayFont} onChange={(event) => setDisplayFont(event.target.value)} />
      </FormField>
      <FormField label="Body font">
        <input value={bodyFont} onChange={(event) => setBodyFont(event.target.value)} />
      </FormField>
      <FormField label="Monospace font">
        <input value={monoFont} onChange={(event) => setMonoFont(event.target.value)} />
      </FormField>

      <h3 className="theme-form-section">Font sizes</h3>
      <div className="theme-form-grid">
        <FormField label="Heading">
          <input value={headingSize} onChange={(event) => setHeadingSize(event.target.value)} />
        </FormField>
        <FormField label="Body">
          <input value={bodySize} onChange={(event) => setBodySize(event.target.value)} />
        </FormField>
        <FormField label="Monospace">
          <input value={monoSize} onChange={(event) => setMonoSize(event.target.value)} />
        </FormField>
      </div>

      <h3 className="theme-form-section">Page backdrop</h3>
      <div className="theme-form-grid">
        <FormField label="Pattern">
          <select
            value={backdrop.pattern}
            onChange={(event) =>
              setBackdrop((prev) => ({ ...prev, pattern: event.target.value as typeof prev.pattern }))
            }
          >
            {backdropPatternValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Grid size">
          <input
            value={backdrop.gridSize}
            onChange={(event) => setBackdrop((prev) => ({ ...prev, gridSize: event.target.value }))}
          />
        </FormField>
        <FormField label="Line width">
          <input
            value={backdrop.lineWidth}
            onChange={(event) => setBackdrop((prev) => ({ ...prev, lineWidth: event.target.value }))}
          />
        </FormField>
        <FormField label="Glow position">
          <select
            value={backdrop.glowPosition}
            onChange={(event) =>
              setBackdrop((prev) => ({
                ...prev,
                glowPosition: event.target.value as typeof prev.glowPosition,
              }))
            }
          >
            {backdropGlowPositionValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Glow size">
          <input
            value={backdrop.glowSize}
            onChange={(event) => setBackdrop((prev) => ({ ...prev, glowSize: event.target.value }))}
          />
        </FormField>
        <FormField label="Glow color">
          <ColorInput
            value={backdrop.glowColor}
            onChange={(value) => setBackdrop((prev) => ({ ...prev, glowColor: value }))}
          />
        </FormField>
      </div>

      <h3 className="theme-form-section">Image backdrop</h3>
      <FormField label="Use image backdrop">
        <input
          type="checkbox"
          checked={useImageBackdrop}
          disabled={!storedImage}
          onChange={(event) => setUseImageBackdrop(event.target.checked)}
        />
      </FormField>
      {!theme && <p className="theme-form-help">Save the theme first, then upload a background image.</p>}
      {theme && (
        <FormField label="Background image" error={imageError}>
          <input
            type="file"
            accept={themeImageMimeTypes.join(',')}
            onChange={(event) => void uploadImage(event)}
          />
        </FormField>
      )}
      {storedImage && <p className="theme-form-help">An image is stored for this theme.</p>}

      <h3 className="theme-form-section">Icon assets</h3>
      <p className="theme-form-help">
        Each key below carries the SVG path and viewBox the UI uses to render that icon. Defaults match the
        bundled outline set; edit to customize.
      </p>
      <div className="theme-icon-assets" role="group" aria-label="Icon assets">
        {iconAssetKeys.map((key) => (
          <div key={key} className="theme-icon-row">
            <div className="theme-icon-preview" aria-hidden="true">
              <ThemeIcon name={key} />
            </div>
            <span className="theme-icon-name">{key}</span>
            <input
              value={iconAssets[key].path}
              onChange={(event) => setIconPath(key, event.target.value)}
              aria-label={`${key} path`}
              placeholder="SVG path d"
            />
            <input
              value={iconAssets[key].viewBox}
              onChange={(event) => setIconViewBox(key, event.target.value)}
              aria-label={`${key} viewBox`}
              placeholder="0 0 24 24"
            />
          </div>
        ))}
      </div>

      <h3 className="theme-form-section">Tag color palette</h3>
      <div className="theme-palette-editor">
        {palette.map((entry, index) => (
          <div key={index} className="theme-palette-row">
            <ColorInput
              value={entry}
              onChange={(value) => setPaletteColor(index, value)}
              picker
              pickerLabel={`Palette color ${index + 1}`}
              ariaLabel={`Palette hex ${index + 1}`}
              placeholder="#RRGGBB"
            />
            <button
              type="button"
              className="quiet"
              onClick={() => removePaletteColor(index)}
              aria-label={`Remove palette color ${index + 1}`}
            >
              <ThemeIcon name="close" />
            </button>
          </div>
        ))}
        <button type="button" className="quiet" onClick={addPaletteColor}>
          Add color
        </button>
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit">Save theme</button>
        <button type="button" className="quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}