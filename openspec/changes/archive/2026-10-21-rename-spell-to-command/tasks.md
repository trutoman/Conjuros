## 1. Contracts

- [x] 1.1 Change `itemKinds` to `['command', 'web-link', 'markdown', 'file']` in `packages/contracts/src/items.ts`
- [x] 1.2 Rename `spellInputSchema` to `commandInputSchema` with `kind: z.literal('command')` and update the discriminated union
- [x] 1.3 Rewrite the cross-kind update guards and messages for `command` (command updates cannot carry `url`, `content`, or `filename`; other kinds cannot carry `command`)
- [x] 1.4 Rename the `themeKindColorsSchema` key `spell` to `command` and replace `'spell'` with `'command'` in `iconAssetKeys` in `packages/contracts/src/theme.ts`

## 2. API and Persistence

- [x] 2.1 Update `src/api/services/items.service.ts` branches and persisted mapping from `spell` to `command`
- [x] 2.2 Update both `InMemoryItemsRepository` and `PostgresItemsRepository` create paths to store `command` when `kind === 'command'`
- [x] 2.3 Change `collection_items_kind_fields_check` in `src/api/db/schema.ts` to test for the `command` enum value
- [x] 2.4 Update `themeSeed.ts` light/dark `kindColors` and icon defaults to use `command`
- [x] 2.5 Update `themes.service.ts` and related theme code so the keyed record, fallbacks, and backfill use `command`

## 3. Database Migration

- [x] 3.1 Run `npm run db:generate` after the schema/contracts change and inspect `drizzle/0004_*.sql` plus `drizzle/meta/0004_snapshot.json`
- [x] 3.2 Replace any generated enum drop/recreate with an in-place `ALTER TYPE "public"."item_kind" RENAME VALUE 'spell' TO 'command'`, dropping `collection_items_kind_fields_check` first and recreating it with the `command` literal afterward
- [x] 3.3 Add JSONB rewrites that move `kind_colors.spell` and object-shaped `icon_assets.spell` to `command`, preserving existing `command` values when both keys exist
- [x] 3.4 Add the legacy array rewrite that replaces a `spell` element in `icon_assets` with `command`
- [x] 3.5 Verify the `0004` snapshot records the new enum value and check constraint, and that fresh 0000→0004 and upgraded 0003→0004 paths both apply cleanly
- [x] 3.6 Add a PGlite migration test that seeds a `spell` item and themes with old theme keys before `0004`, then asserts the item kind and theme JSONB keys become `command` with values preserved

## 4. Frontend

- [x] 4.1 Update `ItemCard.tsx`: `isCommand`, `Command` badge, `command` icon key, and `kind-command` class while keeping the `Copy command` action
- [x] 4.2 Update `ItemForm.tsx`, `ItemTypeSelector.tsx`, and `CollectionPage.tsx` to submit/select `command` and show `Command`/`Commands` labels
- [x] 4.3 Update `EmptyState.tsx` copy to refer to a command instead of a spell
- [x] 4.4 Update `ThemeForm.tsx`, `ThemeListView.tsx`, `applyTheme.ts`, and `iconAssets.ts` to use the `command` kind color and icon asset keys
- [x] 4.5 Replace `--spell` with `--command`, `.kind-spell` with `.kind-command`, and update the theme-list preview and any other CSS consumers
- [x] 4.6 Change the command validation message in `src/web/lib/itemForm.ts` to `"Command is required"`

## 5. Tests and Fixtures

- [x] 5.1 Rename contract/API/repository test fixtures and helpers (`createSpellItem`, `spell()`, `kind: 'spell'`) to command equivalents
- [x] 5.2 Update frontend tests for the `Command` selector/badge, `kind-command`, `--command`, `command` icon key, and the new validation message
- [x] 5.3 Update theme tests and fixtures for `kindColors.command`, `iconAssets.command`, and the twenty-one-key list
- [x] 5.4 Update the schema constraint tests and any row fixtures to use `kind: 'command'`
- [x] 5.5 Run a repository search over `src/` and `packages/` and confirm the only remaining `spell` matches are the new migration SQL, the pre-upgrade migration-test fixture, and negative tests for the rejected legacy kind

## 6. Documentation and Specs

- [x] 6.1 Update `README.md`, `AGENTS.md`, and `docs/init.md` to use command/command-item terminology
- [x] 6.2 Leave archived OpenSpec changes, legacy Speckit specs, old Drizzle migrations/snapshots, `dist/`, and `backup-*` untouched
- [x] 6.3 Ensure current main specs are synced from the change deltas when archiving

## 7. Verification

- [x] 7.1 Run `npm run check` and resolve lint, test, and build failures
- [x] 7.2 Verify the API rejects `kind: "spell"`/`kind=spell` and accepts `command`
- [x] 7.3 Verify existing rows and theme documents survive the migration with command text, colors, paths, and viewBoxes unchanged
