import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagColumnIcon } from '../TagColumnIcon';

describe('TagColumnIcon', () => {
  it('renders decorative SVG with aria-hidden="true" by default', () => {
    const { container } = render(<TagColumnIcon />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('fill')).toBe('none');
  });

  it('renders with custom aria-label when provided', () => {
    render(<TagColumnIcon ariaLabel="Marcapáginas de barra suave" />);
    const svg = screen.getByLabelText('Marcapáginas de barra suave');
    expect(svg).toBeDefined();
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('applies custom size and className props', () => {
    const { container } = render(<TagColumnIcon size={24} className="custom-icon" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
    expect(svg?.classList.contains('custom-icon')).toBe(true);
  });
});
