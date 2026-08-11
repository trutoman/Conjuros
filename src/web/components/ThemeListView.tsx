import type { Theme } from '@conjuros/contracts';

export function ThemeListView({
  themes,
  onEdit,
  onAdd,
  onActivate,
  onDelete,
}: {
  themes: Theme[];
  onEdit: (theme: Theme) => void;
  onAdd: () => void;
  onActivate: (theme: Theme) => void;
  onDelete: (theme: Theme) => void;
}) {
  return (
    <div className="theme-list">
      <ul>
        {themes.map((theme) => (
          <li key={theme.id} className="theme-list-row">
            <span className="theme-list-preview" aria-hidden="true">
              {theme.kindColors.spell}
            </span>
            <div className="theme-list-info">
              <strong>{theme.label}</strong>
              <span className="theme-list-name">
                {theme.name}
                {theme.isDefault ? ' · default' : ''}
              </span>
            </div>
            <div className="theme-list-actions">
              {!theme.isDefault && (
                <button
                  type="button"
                  className="quiet"
                  onClick={() => onActivate(theme)}
                  aria-label={`Make ${theme.label} the default`}
                >
                  Activate
                </button>
              )}
              <button type="button" className="quiet" onClick={() => onEdit(theme)}>
                Edit
              </button>
              <button
                type="button"
                className="quiet danger"
                disabled={theme.isDefault}
                onClick={() => onDelete(theme)}
                aria-label={`Delete ${theme.label}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onAdd}>
        Add theme
      </button>
    </div>
  );
}