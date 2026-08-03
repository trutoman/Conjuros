# Quickstart: Item Collection UI Refresh

## Prerequisites

- Node.js and npm installed.
- The application dependencies installed.
- A signed-in user account for checking theme persistence.

## Setup

1. Install dependencies.
2. Start the development app.
3. Open the collection page in the browser.

## Validation Scenarios

### 1. Theme persistence

1. Open the app as an authenticated user.
2. Switch from light to dark or dark to light.
3. Reload the page.
4. Sign in with the same account in a fresh browser profile or second browser.

**Expected outcome**: The selected theme remains active for that user across reloads and sessions.

### 2. Item card actions

1. Open a spell card and inspect the command block.
2. Copy the command.
3. Open a web-link card and trigger the open action explicitly.
4. Hover or focus the card to reveal edit and delete actions.

**Expected outcome**: Copy produces a visible success or failure cue, the link opens only after user action, and secondary actions remain visually de-emphasized until interaction.

### 3. Tag color visibility

1. Edit a tag with a color value.
2. Save the tag.
3. View the tag in the tag editor and inside an item card.

**Expected outcome**: The selected color is visible during editing, and item views render the tag text in the saved color.

### 4. Keyboard accessibility

1. Navigate the collection with keyboard only.
2. Move through cards, buttons, and form controls.

**Expected outcome**: Focus states remain visible, the interface remains usable without hover, and all interactive controls are reachable.

## Validation Commands

- `npm run dev` to start the app.
- `npm run test` to run the automated test suite.
- `npm run check` to run lint, tests, and build together.

## Notes

- This feature is validated when both the browser checks and the automated tests confirm theme persistence, action feedback, tag color rendering, and keyboard usability.
- The automated suite run on 2026-07-29 passed with theme persistence, item-card interaction, and tag-color coverage.
