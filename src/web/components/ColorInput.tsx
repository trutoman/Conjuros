const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

export function ColorInput({
  value,
  onChange,
  ariaLabel,
  pickerLabel,
  placeholder,
  picker = false,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  pickerLabel?: string;
  placeholder?: string;
  picker?: boolean;
}) {
  return (
    <span className="color-input">
      {picker ? (
        <input
          type="color"
          className="color-input-picker"
          value={hexColorPattern.test(value.trim()) ? value.trim() : '#1A73E8'}
          onChange={(event) => onChange(event.target.value)}
          aria-label={pickerLabel ?? 'Color picker'}
        />
      ) : (
        <span
          className="color-input-swatch"
          aria-hidden="true"
          style={value ? { backgroundColor: value } : undefined}
        />
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        placeholder={placeholder}
      />
    </span>
  );
}
