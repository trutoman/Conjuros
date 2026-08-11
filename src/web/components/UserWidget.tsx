import type { KeyboardEvent } from 'react';

function SignOutIcon() {
  return (
    <svg
      className="user-widget-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
    </svg>
  );
}

export function UserWidget({ userLabel, onSignOut }: { userLabel: string; onSignOut: () => void }) {
  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    onSignOut();
  }

  return (
    <div className="user-widget" role="group" aria-label={`Signed in as ${userLabel}`}>
      <span className="user-widget-name">{userLabel}</span>
      <span
        className="user-widget-icon-shell"
        role="button"
        tabIndex={0}
        aria-label={`Sign out ${userLabel}`}
        onClick={onSignOut}
        onKeyDown={handleKeyDown}
      >
        <SignOutIcon />
      </span>
    </div>
  );
}
