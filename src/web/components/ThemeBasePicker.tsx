import { useState } from 'react';
import type { Theme } from '@conjuros/contracts';
import { ThemeIcon } from './ThemeIcon';

export function ThemeBasePicker({
  themes,
  onConfirm,
  onCancel,
}: {
  themes: Theme[];
  onConfirm: (theme: Theme) => void;
  onCancel: () => void;
}) {
  const initialTheme = themes.find((theme) => theme.isDefault) ?? themes[0];
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(initialTheme?.id ?? null);
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) ?? null;

  return (
    <div className="item-form theme-base-picker">
      <button
        type="button"
        className="form-close"
        aria-label="Close base theme selection"
        onClick={onCancel}
      >
        <ThemeIcon name="close" />
      </button>
      <h2>Choose a base theme</h2>
      <p className="theme-form-help">
        The new theme starts with the colors, fonts, backdrop, icons, and palette of the theme you
        choose.
      </p>
      <div className="theme-selector-list" role="radiogroup" aria-label="Base theme">
        {themes.map((theme) => (
          <label key={theme.id} className="theme-selector-option">
            <input
              type="radio"
              name="base-theme"
              value={theme.id}
              checked={selectedThemeId === theme.id}
              onChange={() => setSelectedThemeId(theme.id)}
            />
            <span>{theme.label}</span>
            {theme.isDefault && <span className="theme-selector-current">default</span>}
          </label>
        ))}
      </div>
      {themes.length === 0 && (
        <p className="theme-form-help">There are no themes to base a new theme on.</p>
      )}
      <div className="form-actions">
        <button type="button" disabled={!selectedTheme} onClick={() => selectedTheme && onConfirm(selectedTheme)}>
          Create from theme
        </button>
        <button type="button" className="quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
