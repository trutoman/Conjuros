import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagForm } from '../TagForm';

describe('TagForm', () => {
  it('shows inline validation when color is invalid', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'blue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(screen.getByText('Tag color must use the #RRGGBB format')).toBeInTheDocument();
  });
});
