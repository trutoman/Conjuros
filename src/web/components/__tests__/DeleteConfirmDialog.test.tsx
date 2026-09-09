import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

function confirmDialogRule(): string {
  const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
  const match = css.match(/\.confirm-dialog\s*\{([^}]*)\}/);
  if (!match) throw new Error('.confirm-dialog rule not found in index.css');
  return match[1];
}

function confirmDialogActionsRule(): string {
  const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
  const match = css.match(/\.confirm-dialog-actions\s*\{([^}]*)\}/);
  if (!match) throw new Error('.confirm-dialog-actions rule not found in index.css');
  return match[1];
}

describe('DeleteConfirmDialog', () => {
  it('renders the title, actions, and optional details', () => {
    render(
      <DeleteConfirmDialog
        title="azure.pipelines"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        details="This will also delete the 1 tag in this category."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Delete azure.pipelines?' })).toBeInTheDocument();
    expect(
      screen.getByText('This will also delete the 1 tag in this category.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete item' }).parentElement).toHaveClass(
      'confirm-dialog-actions',
    );
  });

  it('confirms and cancels through the provided handlers', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<DeleteConfirmDialog title="azure.pipelines" onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('styles the dialog surface with theme variables instead of hardcoded colors', () => {
    const rule = confirmDialogRule();

    expect(rule).toMatch(/background:\s*var\(--surface\)/);
    expect(rule).toMatch(/border:\s*2px solid var\(--border-strong\)/);
    expect(rule).toMatch(/color:\s*var\(--text\)/);
    expect(rule).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('separates the confirmation actions with a small flex gap', () => {
    const rule = confirmDialogActionsRule();

    expect(rule).toMatch(/display:\s*flex/);
    expect(rule).toMatch(/gap:\s*0\.75rem/);
  });
});
