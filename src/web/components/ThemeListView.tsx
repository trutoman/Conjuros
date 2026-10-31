import type { Theme } from '@conjuros/contracts';

export function ThemeListView({
  themes,
  onEdit,
  onActivate,
  onDelete,
}: {
  themes: Theme[];
  onEdit: (theme: Theme) => void;
  onActivate: (theme: Theme) => void;
  onDelete: (theme: Theme) => void;
}) {
  return (
    <div className="theme-list">
      <ul>
        {themes.map((theme) => (
          <li key={theme.id} className="theme-list-row">
            <div className="theme-list-info">
              <strong>{theme.label}</strong>
              {theme.isDefault && <span className="theme-list-default">default</span>}
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
    </div>
  );
}