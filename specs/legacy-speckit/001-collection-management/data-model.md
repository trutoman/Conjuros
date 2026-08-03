# Data Model: Collection Management

## Overview

The feature centers on a private collection of user-owned items. Each item is either a spell or a web link, and each item is scoped to one authenticated user.

## Entities

| Entity | Fields | Notes |
| --- | --- | --- |
| User | `id`, `email`, `passwordHash`, `createdAt`, `updatedAt` | Represents the authenticated account owner. |
| CollectionItem | `id`, `ownerId`, `kind`, `title`, `description`, `tags`, `order`, `relatedItemIds`, `createdAt`, `updatedAt`, plus `command` or `url` depending on type | The primary domain object for the feature. |
| Tag | `value` | A normalized label used for filtering and classification. |
| CollectionViewState | `search`, `kindFilter`, `tagFilters`, `sort`, `order` | Client-side view state that does not change ownership rules. |

## CollectionItem Validation Rules

### Shared rules

- `ownerId` must reference the authenticated user.
- `title` must be a non-empty string.
- `description` may be empty or a trimmed string.
- `tags` must be unique, normalized, and validated against the available tag catalog.
- `order` must be a positive integer and must be persisted for reorder operations.
- `relatedItemIds` must only reference items owned by the same user.

### Spell-specific rules

- `kind` must be `spell`.
- `command` is required and must be stored exactly as entered by the user.
- The command must never be executed by the application.

### Web-link-specific rules

- `kind` must be `web-link`.
- `url` is required and must be an absolute `http://` or `https://` URL.
- Opening the link must only occur after explicit user action.

## Relationships

- A `User` owns many `CollectionItem` records.
- A `CollectionItem` may reference other `CollectionItem` records owned by the same user through `relatedItemIds`.
- `Tag` values are attached to collection items as a normalized list for filtering and display.

## State Transitions

- Create: a valid item payload is accepted and stored with an initial order value.
- Update: an existing item can be edited, with revalidation before persistence.
- Reorder: the item order changes and the new sequence is persisted.
- Delete: the item is removed from the user’s collection and no longer appears in results.

## Persistence Notes

- The repository layer owns MongoDB access and is the only place that touches persistence.
- The service layer owns authorization and business validation rules.
- The API layer validates boundary input and formats responses without implementing domain logic.