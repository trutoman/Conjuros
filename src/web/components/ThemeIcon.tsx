import type { IconAssetKey } from '@conjuros/contracts';
import { useThemeIcons } from './ThemeIconsContext';

export function ThemeIcon({
  name,
  label,
  title,
  className,
}: {
  name: IconAssetKey;
  label?: string;
  title?: string;
  className?: string;
}) {
  const icons = useThemeIcons();
  const definition = icons[name];
  const accessible = Boolean(label);
  return (
    <svg
      className={['icon', className].filter(Boolean).join(' ') || 'icon'}
      role={accessible ? 'img' : undefined}
      aria-label={label}
      aria-hidden={accessible ? undefined : true}
      viewBox={definition.viewBox}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={definition.path} />
    </svg>
  );
}