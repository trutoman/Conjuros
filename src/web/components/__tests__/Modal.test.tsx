import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../Modal';

function renderModal(props?: Partial<React.ComponentProps<typeof Modal>>) {
  const onClose = vi.fn();
  render(
    <Modal label="Test dialog" onClose={onClose} {...props}>
      <button>Inside action</button>
    </Modal>,
  );
  return onClose;
}

describe('Modal', () => {
  it('renders a dialog with an accessible name', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument();
  });

  it('closes when the backdrop is clicked', () => {
    const onClose = renderModal();

    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the dialog panel', () => {
    const onClose = renderModal();

    fireEvent.mouseDown(screen.getByTestId('modal-dialog'));
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Inside action' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes only the topmost modal on Escape when nested', () => {
    const onCloseOuter = vi.fn();
    const onCloseInner = vi.fn();
    render(
      <Modal label="Outer dialog" onClose={onCloseOuter}>
        <p>outer</p>
      </Modal>,
    );
    render(
      <Modal label="Inner dialog" onClose={onCloseInner}>
        <p>inner</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
  });

  it('moves focus into the dialog on open and restores it on close', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Opener';
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(
      <Modal label="Test dialog" onClose={vi.fn()}>
        <p>content</p>
      </Modal>,
    );

    expect(screen.getByTestId('modal-dialog')).toHaveFocus();

    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('does not dismiss via backdrop or Escape while dismissal is disabled', () => {
    const onClose = renderModal({ isDismissDisabled: true });

    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
