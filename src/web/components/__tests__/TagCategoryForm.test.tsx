import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagCategoryForm } from '../TagCategoryForm';

const category = {
  id: 'cat-work',
  name: 'work',
  description: '',
  tagIds: ['tag-1'],
  tagCount: 1,
  order: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TagCategoryForm', () => {
  it('pre-fills the current category name in lowercase', () => {
    render(<TagCategoryForm category={category} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Rename category' })).toBeInTheDocument();
    expect(screen.getByLabelText('Category name')).toHaveValue('work');
  });

  it('lowercases the name as the user types and saves the normalized value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TagCategoryForm category={category} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Job' } });
    expect(screen.getByLabelText('Category name')).toHaveValue('job');

    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(onSubmit).toHaveBeenCalledWith('job');
  });

  it('rejects names with invalid characters without submitting', () => {
    const onSubmit = vi.fn();
    render(<TagCategoryForm category={category} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'work!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tag category must use only alphanumeric characters and dots',
    );
  });

  it('surfaces submit failures and keeps the form open', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Category is not empty'));
    render(<TagCategoryForm category={category} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'job' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Category is not empty');
    expect(screen.getByRole('heading', { name: 'Rename category' })).toBeInTheDocument();
  });

  it('cancels without submitting', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TagCategoryForm category={category} onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
