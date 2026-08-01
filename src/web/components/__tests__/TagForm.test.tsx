import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagForm } from '../TagForm';

describe('TagForm', () => {
  it('does not submit when the category is missing', () => {
    const onSubmit = vi.fn();
    render(<TagForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: '#123ABC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows inline validation when color is invalid', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: 'blue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(screen.getByText('Tag color must use the #RRGGBB format')).toBeInTheDocument();
  });

  it('renders a visible swatch for the selected color', () => {
    render(
      <TagForm
        tag={{
          id: 'tag-1',
          tagName: 'work.todo',
          tagCategory: 'Work',
          description: '',
          color: '#123ABC',
          order: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Tag color')).toHaveValue('#123ABC');
    expect(document.querySelector('.color-preview')).toBeInTheDocument();
  });
});
