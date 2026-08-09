export function TagColumnIcon({
  className = '',
  size = 18,
  ariaLabel,
}: {
  className?: string;
  size?: number | string;
  ariaLabel?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linejoin="round"
      className={`tag-column-icon ${className}`.trim()}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-hidden': 'true' })}
    >
      <path d="M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z" />
    </svg>
  );
}
