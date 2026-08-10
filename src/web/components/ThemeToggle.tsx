import type { ThemePreference } from '@conjuros/contracts';
import { ThemeIcon } from './ThemeIcon';

export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void | Promise<void>;
}) {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme preference">
      <button
        type="button"
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
        onClick={() => void onChange('light')}
      >
        <ThemeIcon name="sun" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
        onClick={() => void onChange('dark')}
      >
        <ThemeIcon name="moon" />
      </button>
    </div>
  );
}