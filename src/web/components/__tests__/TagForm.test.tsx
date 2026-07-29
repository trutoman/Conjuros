import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagForm } from '../TagForm';

describe('TagForm', () => {
  it('shows inline validation when color is invalid', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: 'blue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(screen.getByText('Tag color must use the #RRGGBB format')).toBeInTheDocument();
  });

  it('renders a visible swatch for the selected color', () => {
    render(<TagForm tag={{ id: 'tag-1', tagName: 'work.todo', description: '', color: '#123ABC', order: 1, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Tag color')).toHaveValue('#123ABC');
    expect(document.querySelector('.color-preview')).toBeInTheDocument();
  });
});
