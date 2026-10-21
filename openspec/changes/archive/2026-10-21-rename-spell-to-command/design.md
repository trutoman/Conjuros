## Context

`spell` is the item kind identifier, while the text it stores is already exposed as `command` everywhere (`CollectionItem.command`, the `spellInputSchema.command` field, the `command` database column, the `Copy command` action). The rename therefore changes identifiers and stored values, not the data model shape. Requirements are in `specs/*/spec.md`; motivation is in `proposal.md`.

The affected storage is PostgreSQL with Drizzle migrations applied automatically at API startup (`runMigrations` in `src/api/server.ts`). Themes are JSONB documents in the same database and carry two keys derived from the item kind: `kindColors.spell` and `iconAssets.spell`. Both must move to `command` in existing rows. The database column is already named `command`, so no column rename is required.

## Goals / Non-Goals

**Goals:**
- Make `command` the single vocabulary for the kind, API contract, database enum, theme keys, CSS tokens, tests, and current docs.
- Preserve existing item text, theme colors, and icon artwork through an in-place migration.
- Keep the migration safe for fresh databases (0000→0004) and existing databases (0003→0004).
- Leave no `spell` identifier in active application source after the change.

**Non-Goals:**
- No alias or dual-kind window: `spell` is rejected immediately after deployment.
- No database column rename, no new table, no new dependency.
- No rewrite of immutable history: old migrations/snapshots, archived OpenSpec changes, legacy Speckit specs, `dist/`, and `backup-*`.
- No Markdown, file, or web-link behavior changes.

## Decisions

### D1 — Rename with the same casing shape everywhere

Apply a case-sensitive vocabulary mapping: `spell` → `command`, `Spell` → `Command`, and therefore `spells` → `commands`, `Spells` → `Commands`. Identifiers follow the same rule: `spellInputSchema` → `commandInputSchema`, `createSpellItem` → `createCommandItem`, `isSpell` → `isCommand`, `--spell` → `--command`, `.kind-spell` → `.kind-command`, and icon key `spell` → `command`.

The friendly validation message becomes `"Command is required"` rather than the literal `"Command is required for a command"`. The latter is redundant; the new text is still the field-specific message for a command item.

Rationale: a mechanical case-preserving rename keeps diffs reviewable and removes the vocabulary mismatch without inventing new names. Alternative rejected: keeping `spellInputSchema` or `--spell` for “stability”, which would preserve the exact inconsistency being removed.

### D2 — Treat the wire rename as breaking, with no alias

`itemKinds` becomes `['command', 'web-link', 'markdown', 'file']`; `commandInputSchema` uses `z.literal('command')`; the update schema rejects `command` updates that carry `url`/`content`/`filename` and vice versa. `CollectionQuery.kind` accepts `command`; `kind=spell` fails validation. API error messages change from “Spell updates…” to “Command updates…”.

Rationale: a compatibility alias would leave `spell` in contracts and code and create two valid representations of one kind. The user asked for a rename, not a deprecation window. Alternative rejected: accepting both values during a transition, which complicates tests and persistence for no requested benefit.

### D3 — Rename the PostgreSQL enum in place and recreate the check constraint

The new migration drops `collection_items_kind_fields_check`, runs `ALTER TYPE "public"."item_kind" RENAME VALUE 'spell' TO 'command'`, then recreates the check with the `command` literal (the existing web-link/markdown/file branches are unchanged). Dropping first avoids any dependency surprise; renaming the enum value updates existing rows automatically, so no `UPDATE collection_items SET kind = …` is needed.

Fresh databases still apply the historical `0000_init.sql` with `spell` and then `0004` renames it, so the migration works on both fresh and upgraded databases. PGlite 0.5 (used by the repository tests) supports `ALTER TYPE … RENAME VALUE`; this was verified locally.

Drizzle Kit may emit an enum drop/recreate or omit the rename because it compares snapshots rather than live enum labels. The generated `0004` SQL SHALL be reviewed and, when necessary, replaced with the in-place statements above. The generated `0004_snapshot.json` must still describe the new enum value and check constraint so future diffs are correct.

Rationale: in-place rename preserves row OIDs and avoids a rewrite of every item row. Alternative rejected: creating a new enum type and casting the column, which is more complex and risks locks or lost defaults.

### D4 — Rewrite theme JSONB keys in the same migration

The migration rewrites existing theme documents before the API starts serving them:

- `kind_colors` objects: move the value at `spell` to `command` and remove `spell`.
- Object-shaped `icon_assets`: move the `{ path, viewBox }` entry from `spell` to `command` and remove `spell`.
- Array-shaped `icon_assets` (legacy key arrays): replace the `spell` element with `command`.
- If `command` already exists alongside `spell`, keep the existing `command` value and only drop the stale key.

SQL shape:

```sql
UPDATE "themes"
SET "kind_colors" = CASE
  WHEN "kind_colors" ? 'command' THEN "kind_colors" - 'spell'
  ELSE ("kind_colors" - 'spell') || jsonb_build_object('command', "kind_colors" -> 'spell')
END
WHERE "kind_colors" ? 'spell';

UPDATE "themes"
SET "icon_assets" = CASE
  WHEN "icon_assets" ? 'command' THEN "icon_assets" - 'spell'
  ELSE ("icon_assets" - 'spell') || jsonb_build_object('command', "icon_assets" -> 'spell')
END
WHERE jsonb_typeof("icon_assets") = 'object' AND "icon_assets" ? 'spell';

UPDATE "themes"
SET "icon_assets" = (
  SELECT jsonb_agg(CASE WHEN element = '"spell"'::jsonb THEN '"command"'::jsonb ELSE element END)
  FROM jsonb_array_elements("icon_assets") AS element
)
WHERE jsonb_typeof("icon_assets") = 'array' AND "icon_assets" @> '["spell"]'::jsonb;
```

Rationale: migration-time rewriting means the runtime contract has exactly one accepted key (`command`) and no legacy branching. The API already runs migrations before seeding/backfill and serving requests, so no request can observe an unconverted theme. Alternative rejected: read-time normalization, which would keep `spell` references in application code and defer the data fix forever.

### D5 — Update the seed and defaults with the same keys

`themeSeed.ts` light/dark `kindColors` use `command`; `ICON_ASSETS` exposes `command` with the existing magic-wand path; `ThemeForm` edits `kindColors.command`; `ThemeListView` previews `kindColors.command`; `applyTheme` writes `--command`. `index.css` declares `--command` and colors `.item-card.kind-command`.

Rationale: seeded themes must match the new contract, otherwise a fresh database would fail validation. Alternative rejected: keeping old seed keys and translating them on read, which would reintroduce dual vocabulary.

### D6 — Test the rename and the migration at their boundaries

- Rename all fixtures, helper names, expected kinds, theme keys, icon keys, CSS-property assertions, and copy labels across contracts, API, and frontend tests.
- Add a PGlite migration test that applies the historical migrations, inserts a `spell` item plus themes using `kindColors.spell`, object `iconAssets.spell`, and a legacy `['spell', 'copy']` array, applies `0004`, and asserts the kind and JSONB keys are now `command` with values preserved.
- After implementation, run a repository-wide search for `spell` in `src/` and `packages/`; the only allowed matches are the new migration SQL, the migration test’s pre-upgrade fixture, and negative tests that assert the retired kind is rejected.

Rationale: the rename is mostly mechanical, so the highest-risk behavior is the data conversion, not the string replacement. Alternative rejected: relying only on type-checking, which cannot catch persisted JSON keys.

### D7 — Keep historical artifacts immutable

Do not edit `drizzle/0000`–`0003` or their snapshots, archived OpenSpec changes, `specs/legacy-speckit/`, `dist/`, or `backup-*`. Update current documentation (`README.md`, `AGENTS.md`, `docs/init.md`) and the affected main specs through the delta specs.

Rationale: migrations and archived plans are records of what shipped; rewriting them would break migration hashes and history. The new migration is the bridge from the old vocabulary.

## Risks / Trade-offs

- **Breaking API clients** still sending `kind: "spell"` or `kind=spell` receive 400s → Document the break in the change and update all in-repo callers; no transition alias is kept by design.
- **Theme endpoint failure if migration is skipped** because `themeSchema` requires `command` → API startup applies migrations before serving; the migration test covers object and array shapes; deployment must not bypass `runMigrations`.
- **Drizzle’s generated migration may recreate the enum** and lose the in-place behavior → Review and hand-edit `0004`; verify fresh and upgraded PGlite paths.
- **Stale `spell` strings in historical files** remain searchable → Scope the final search to `src/` and `packages/` and document the intentional exceptions.
- **Admin themes with custom `spell` artwork** could be overwritten → The migration moves the existing value under `command`; the test asserts `path` and `viewBox` survive.
- **Long-running table lock** during enum rename/check recreation → The items table is small and the migration runs at startup; no online-migration machinery is introduced.

## Migration Plan

1. Merge the contracts/API/frontend rename and the new `0004` migration in one release so the running code and schema expect `command`.
2. On API startup, `runMigrations` drops/recreates the check constraint, renames the enum value, and rewrites theme JSONB keys before repositories serve traffic.
3. Seeding runs after migration; an empty database gets the new `command` keys directly.
4. Verification: `npm run check` plus the PGlite migration test; optionally query `enum_range(NULL::item_kind)` and inspect a migrated theme row.
5. Rollback, if required, is a manual reverse migration: drop the constraint, rename `command` back to `spell`, recreate the constraint with `spell`, and rename the JSONB keys back. Drizzle migrations have no automatic down step.

## Open Questions

None.
