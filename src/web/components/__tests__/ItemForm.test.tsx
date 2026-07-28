import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ItemForm } from '../ItemForm';

describe('ItemForm', () => {
  it('shows inline validation when a spell has no command', () => {
    render(<ItemForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My spell' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
    expect(screen.getByText('Command is required for a spell')).toBeInTheDocument();
  });
});