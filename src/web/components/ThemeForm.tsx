import { useState } from 'react';
import {
  iconAssetKeys,
  themeInputSchema,
  type IconAssetDefinition,
  type IconAssetKey,
  type Theme,
  type ThemeInput,
} from '@conjuros/contracts';
import { ICON_ASSETS } from '../lib/iconAssets';
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

const kindColorFields = ['spell', 'webLink', 'markdown', 'file'] as const;

type ColorValues = Record<string, string>;

export function ThemeForm({
  theme,
  onSubmit,
  onCancel,
}: {
  theme?: Theme;
  onSubmit: (input: ThemeInput) => Promise<unknown> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(theme?.name ?? '');
  const [label, setLabel] = useState(theme?.label ?? '');
  const [isDefault, setIsDefault] = useState(theme?.isDefault ?? false);
  const [colors, setColors] = useState<ColorValues>(() => {
    const initial: ColorValues = {};
    for (const field of colorFields) {
      initial[field] = theme?.colors[field] ?? '';
    }
    return initial;
  });
  const [kindColors, setKindColors] = useState<ColorValues>(() => {
    const initial: ColorValues = {};
    for (const field of kindColorFields) {
      initial[field] = theme?.kindColors[field] ?? '';
    }
    return initial;
  });
  const [displayFont, setDisplayFont] = useState(theme?.fonts.display ?? '');
  const [bodyFont, setBodyFont] = useState(theme?.fonts.body ?? '');
  const [monoFont, setMonoFont] = useState(theme?.fonts.mono ?? '');
  const [headingSize, setHeadingSize] = useState(theme?.fontSizes.heading ?? '');
  const [bodySize, setBodySize] = useState(theme?.fontSizes.body ?? '');
  const [monoSize, setMonoSize] = useState(theme?.fontSizes.mono ?? '');
  const [iconAssets, setIconAssets] = useState<Record<IconAssetKey, IconAssetDefinition>>(() => {
    const initial = {} as Record<IconAssetKey, IconAssetDefinition>;
    for (const key of iconAssetKeys) {
      const stored = theme?.iconAssets?.[key];
      const fallback = ICON_ASSETS[key];
      initial[key] = stored ?? { path: fallback.path, viewBox: fallback.viewBox };
    }
    return initial;
  });
  const [palette, setPalette] = useState<string[]>(() => [...(theme?.tagColorPalette ?? [''])]);
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const result = themeInputSchema.safeParse({
      name,
      label,
      colors,
      fonts: { display: displayFont, body: bodyFont, mono: monoFont },
      fontSizes: { heading: headingSize, body: bodySize, mono: monoSize },
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
            <input
              value={colors[field]}
              onChange={(event) => setColors((prev) => ({ ...prev, [field]: event.target.value }))}
            />
          </FormField>
        ))}
      </div>

      <h3 className="theme-form-section">Item kind colors</h3>
      <div className="theme-form-grid">
        {kindColorFields.map((field) => (
          <FormField key={field} label={field}>
            <input
              value={kindColors[field]}
              onChange={(event) =>
                setKindColors((prev) => ({ ...prev, [field]: event.target.value }))
              }
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
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(entry) ? entry : '#1A73E8'}
              onChange={(event) => setPaletteColor(index, event.target.value)}
              aria-label={`Palette color ${index + 1}`}
            />
            <input
              value={entry}
              onChange={(event) => setPaletteColor(index, event.target.value)}
              aria-label={`Palette hex ${index + 1}`}
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