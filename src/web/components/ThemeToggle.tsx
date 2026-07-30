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
      <button type="button" aria-label="Light mode" aria-pressed={theme === 'light'} onClick={() => void onChange('light')}>
        <span aria-hidden="true">☀</span>
      </button>
      <button type="button" aria-label="Dark mode" aria-pressed={theme === 'dark'} onClick={() => void onChange('dark')}>
        <span aria-hidden="true">☾</span>
      </button>
    </div>
  );
}