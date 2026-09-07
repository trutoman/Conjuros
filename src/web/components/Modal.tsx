import { useEffect, useId, useRef } from 'react';

const openModalStack: string[] = [];

export function Modal({
  label,
  onClose,
  children,
  size = 'default',
  isDismissDisabled = false,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'default' | 'wide';
  isDismissDisabled?: boolean;
}) {
  const id = useId();
  const panelRef = useRef<HTMLElement>(null);
  const openerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const disabledRef = useRef(isDismissDisabled);
  disabledRef.current = isDismissDisabled;

  useEffect(() => {
    openerRef.current = document.activeElement;
    openModalStack.push(id);
    panelRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (openModalStack[openModalStack.length - 1] !== id) return;
      if (disabledRef.current) return;
      event.stopPropagation();
      onCloseRef.current();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = openModalStack.indexOf(id);
      if (index !== -1) openModalStack.splice(index, 1);
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [id]);

  function handleBackdropMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !disabledRef.current) {
      onCloseRef.current();
    }
  }

  return (
    <div
      className="dialog-backdrop modal-backdrop"
      data-testid="modal-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-testid="modal-dialog"
        className={`modal-panel${size === 'wide' ? ' modal-panel-wide' : ''}`}
      >
        {children}
      </section>
    </div>
  );
}
