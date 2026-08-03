# Quickstart: Validate the Collection Management Feature

## Prerequisites

- A local MongoDB instance or test database
- Node.js 20 LTS and npm
- A signed-in test user account

## Setup

1. Use Node.js 20 LTS and install the workspace dependencies:

	```sh
	npm install
	```

2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `MONGODB_DATABASE`, and a long random `SESSION_SECRET`. Do not use production or shared MongoDB data for local tests.
3. Start a local MongoDB instance, then run the API and Vite application together:

	```sh
	npm run dev
	```

4. Open `http://localhost:5173`, create an account with a password of at least 12 characters, and sign in.
5. Run the complete automated validation suite:

	```sh
	npm run check
	```

## Validation Scenarios

### Core collection flow

1. Sign in with a test user.
2. Open the collection view and verify only that user’s items appear.
3. Create a new spell, then verify it appears in the list with the exact command text preserved.
4. Copy the command and confirm visible success or failure feedback.

### Editing and deletion

1. Edit an existing item’s title, tags, or related information.
2. Save the changes and verify the updated values appear immediately.
3. Delete an item and confirm it disappears from the collection and search results.

### Search, filter, and ordering

1. Create items with different types and tags.
2. Apply search and filter controls and confirm the list updates predictably.
3. Reorder items with pointer and keyboard interaction, reload the page, and confirm the saved order remains.

### Security and error handling

1. Attempt to access or modify another user’s item through a direct identifier or route.
2. Submit invalid data such as a missing command, malformed URL, or duplicate tag values.
3. Verify the API returns appropriate validation or authorization errors and the UI shows clear feedback.

## Expected Outcomes

- The collection view is private and scoped to the authenticated user.
- Spell commands are copied exactly and web links open only after explicit user action.
- Search, filters, and reordering behave predictably and persist across reloads.