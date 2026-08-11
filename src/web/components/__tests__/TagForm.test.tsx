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

  it('renders existing tag name and category in lowercase', () => {
    render(
      <TagForm
        tag={{
          id: 'tag-1',
          tagName: 'Work.Todo',
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

    expect(screen.getByLabelText('Tag name')).toHaveValue('work.todo');
    expect(screen.getByLabelText('Tag category')).toHaveValue('work');
  });

  it('lowercases tag name and category as the user types', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'Work.Todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });

    expect(screen.getByLabelText('Tag name')).toHaveValue('work.todo');
    expect(screen.getByLabelText('Tag category')).toHaveValue('work');
  });

  it('renders a borderless close button that invokes onCancel', () => {
    const onCancel = vi.fn();
    render(<TagForm onSubmit={vi.fn()} onCancel={onCancel} />);

    const closeButton = screen.getByRole('button', { name: 'Close tag form' });
    expect(closeButton.querySelector('svg.icon')).not.toBeNull();
    expect(closeButton.className).toBe('form-close');
    fireEvent.click(closeButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('offers the theme palette colors as selectable swatches', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} palette={['#1A73E8', '#7C3AED']} />);

    expect(screen.getByRole('group', { name: 'Tag color palette' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #1A73E8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #7C3AED' })).toBeInTheDocument();
  });

  it('rejects saving a color outside the active theme palette', () => {
    const onSubmit = vi.fn();
    render(<TagForm onSubmit={onSubmit} onCancel={vi.fn()} palette={['#1A73E8', '#7C3AED']} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: '#123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Tag color must be part of the active theme palette')).toBeInTheDocument();
  });

  it('accepts palette colors with case-insensitive matching', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TagForm onSubmit={onSubmit} onCancel={vi.fn()} palette={['#1A73E8', '#7C3AED']} />);

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: '#1a73e8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('selects a palette swatch by pressing it', () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} palette={['#1A73E8', '#7C3AED']} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select color #7C3AED' }));

    expect(screen.getByLabelText('Tag color')).toHaveValue('#7C3AED');
  });
});
