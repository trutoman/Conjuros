import type { Theme } from '@conjuros/contracts';
import { ThemeIcon } from './ThemeIcon';

export function ThemeToggle({
  themeId,
  themes,
  onChange,
}: {
  themeId: string | null;
  themes: Theme[];
  onChange: (themeId: string) => void | Promise<void>;
}) {
  const lightThemeId = themes.find((theme) => theme.name === 'light')?.id;
  const darkThemeId = themes.find((theme) => theme.name === 'dark')?.id;
  return (
    <div className="theme-toggle" role="group" aria-label="Theme preference">
      <button
        type="button"
        aria-label="Light mode"
        aria-pressed={Boolean(lightThemeId && themeId === lightThemeId)}
        disabled={!lightThemeId}
        onClick={() => lightThemeId && void onChange(lightThemeId)}
      >
        <ThemeIcon name="sun" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={Boolean(darkThemeId && themeId === darkThemeId)}
        disabled={!darkThemeId}
        onClick={() => darkThemeId && void onChange(darkThemeId)}
      >
        <ThemeIcon name="moon" />
      </button>
    </div>
  );
}
