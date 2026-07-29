import type { ThemePreference } from '@conjuros/contracts';

export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void | Promise<void>;
}) {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme preference">
      <button type="button" aria-pressed={theme === 'light'} onClick={() => void onChange('light')}>
        Light
      </button>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => void onChange('dark')}>
        Dark
      </button>
    </div>
  );
}