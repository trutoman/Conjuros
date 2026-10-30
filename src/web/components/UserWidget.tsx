import { useEffect, useRef, useState } from 'react';

export function UserWidget({
  userLabel,
  onSignOut,
  onThemeSelector,
  onThemeEditor,
}: {
  userLabel: string;
  onSignOut: () => void;
  onThemeSelector?: () => void;
  onThemeEditor?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function openThemeSelector() {
    setIsOpen(false);
    onThemeSelector?.();
  }

  function openThemeEditor() {
    setIsOpen(false);
    onThemeEditor?.();
  }

  return (
    <div ref={rootRef} className="user-widget">
      <button
        type="button"
        className="user-widget-name"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {userLabel}
      </button>
      {isOpen && (
        <div className="user-widget-menu" role="menu" aria-label={`${userLabel} menu`}>
          <button type="button" role="menuitem" disabled>Profile</button>
          <button type="button" role="menuitem" onClick={openThemeSelector}>Theme selector</button>
          {onThemeEditor && (
            <button type="button" role="menuitem" onClick={openThemeEditor}>Theme editor</button>
          )}
          <button type="button" role="menuitem" onClick={() => { setIsOpen(false); onSignOut(); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}
