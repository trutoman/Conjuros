## Why

The collection has an item kind named `spell`, but the value it stores has always been called `command`. The mismatch appears in the API contract, database enum, theme keys, CSS tokens, tests, and documentation, and it forces every reader to translate between two names for the same concept. Renaming the kind to `command` makes the domain vocabulary consistent from the database to the UI.

## What Changes

- **BREAKING** Rename the item kind `spell` to `command` across the contracts, API, repositories, database enum, persisted rows, query filter, and tests. Requests that still send `kind: "spell"` or filter with `kind=spell` SHALL be rejected; no compatibility alias is kept.
- Rename the user-facing labels `Spell`/`Spells` to `Command`/`Commands` in the item type selector, card badge, collection type filter, empty state, and validation messages.
- Rename the per-kind theme color key `spell` to `command` in `Theme.kindColors`, the `--spell` CSS custom property to `--command`, the `.kind-spell` card class to `.kind-command`, and all seeded/default theme values.
- Rename the icon asset key `spell` to `command` in `IconAssetKey`, `ICON_ASSETS`, and every theme's stored `iconAssets` record.
- Add a database migration that renames the `item_kind` enum value in place, recreates the kind/field check constraint with `command`, and rewrites existing theme documents so `kindColors.spell` and `iconAssets.spell` become `command`.
- Update the current documentation (`README.md`, `AGENTS.md`, and `docs/init.md`) and the affected main specs.
- Adjust all tests, fixtures, and helpers to use `command`, including API, repository, contract, theme, and frontend suites.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-management`: the item kind `spell` becomes `command`, including creation, update, filtering, validation messages, the type selector, and the database value.
- `item-card-experience`: command cards use the `Command` badge, the `command` icon key, and `command` terminology in card actions and scenarios.
- `theme-icon-storage`: the icon asset key `spell` becomes `command`, including its stored artwork and admin editing scenario.
- `theme-storage-migration`: existing stored themes whose `kindColors` or `iconAssets` use the old `spell` key are migrated to `command`, and legacy key-array examples use the new key.

## Impact

- `packages/contracts/src/items.ts`: `itemKinds`, input schemas, cross-kind guards, and update error messages.
- `packages/contracts/src/theme.ts`: `themeKindColorsSchema` and `iconAssetKeys`.
- `src/api/db/schema.ts`: the enum source and the `collection_items_kind_fields_check` constraint.
- `drizzle/`: a new migration and snapshot; existing `0000`–`0003` migrations and snapshots stay as immutable history.
- `src/api/repositories/items.repository.ts`, `src/api/services/items.service.ts`: kind branches and persisted `command` mapping.
- `src/api/repositories/themeSeed.ts`, `src/api/services/themes.service.ts`: seeded/default `command` color and icon keys; legacy normalization where applicable.
- `src/web/`: item form, type selector, card, empty state, collection filter, theme form/list, icon defaults, theme application, and CSS tokens/classes.
- `src/tests/` and `src/web/**/__tests__/`: fixtures and assertions renamed to `command`.
- Docs: `README.md`, `AGENTS.md`, and `docs/init.md`.
- **Non-goals:** do not rewrite archived OpenSpec changes, legacy Speckit specs, old Drizzle migrations/snapshots, the `dist/` build, or the `backup-*` directory. No database column rename is needed because the command text column is already named `command`.
