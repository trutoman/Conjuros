import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagMatchToggle } from '../TagMatchToggle';

describe('TagMatchToggle', () => {
  it('renders OR and AND buttons', () => {
    render(<TagMatchToggle mode="all" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Match any tag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match all tags' })).toBeInTheDocument();
  });

  it('highlights AND as active when mode is "all"', () => {
    render(<TagMatchToggle mode="all" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Match all tags' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Match any tag' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('highlights OR as active when mode is "any"', () => {
    render(<TagMatchToggle mode="any" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Match any tag' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Match all tags' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with "any" when OR button is clicked', () => {
    const onChange = vi.fn();
    render(<TagMatchToggle mode="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Match any tag' }));
    expect(onChange).toHaveBeenCalledWith('any');
  });

  it('calls onChange with "all" when AND button is clicked', () => {
    const onChange = vi.fn();
    render(<TagMatchToggle mode="any" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Match all tags' }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('has accessible group structure with role and aria-label', () => {
    render(<TagMatchToggle mode="all" onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'Tag match mode' });
    expect(group).toBeInTheDocument();
  });
});
