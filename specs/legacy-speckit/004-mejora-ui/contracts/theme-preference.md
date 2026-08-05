# Contract: Theme Preference Persistence

## Purpose

Document the user-facing contract needed to persist the selected theme per authenticated user.

## Contract Scope

- The authenticated user must have a persisted theme preference.
- The client must be able to read the current theme when the session is established.
- The client must be able to update the theme preference explicitly.

## Conceptual Interface

### Read Current User State

- Returns the authenticated user's identifier, email, and current theme preference.
- The theme preference must be either `light` or `dark`.

### Update Theme Preference

- Accepts a request containing the desired theme.
- Rejects unsupported theme values.
- Returns the updated preference for the authenticated user.

## Behavioral Guarantees

- The default theme is used when no preference exists.
- Theme updates apply only to the authenticated user.
- Theme preference survives reloads and follows the user across devices.

## Error Expectations

- Unauthenticated requests must be rejected.
- Invalid theme values must be rejected with a clear validation response.
