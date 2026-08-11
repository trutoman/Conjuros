## Context

After `svg-icons-from-themes` and `theme-svg-sprite-icons`, the theme contract requires `Theme.iconAssets` to be a flat `string[]` of `IconAssetKey`s. The artwork is no longer carried per-theme — it lives in the bundled SVG sprite (`src/web/components/Sprite.tsx`) populated from `src/web/lib/iconAssets.ts`. Each stored theme declares only which sprite symbols it exposes.

Stored theme documents in MongoDB predate `theme-svg-sprite-icons`. The earliest stored shape is a `string[]` of 16 keys (the original key set, missing `close`, `sun`, `moon`, `add`); some documents carry a transient per-key `{path, viewBox}` record from the brief window when the contract was keyed (between `svg-icons-from-themes` and `theme-svg-sprite-icons`). The themes service already normalizes both shapes on read via `normalizeStoredTheme`. The goal of this change is to make the database own the artwork-selection state: every stored theme carries a 20-entry id list so the runtime normalization is just a passthrough.

## Goals / Non-Goals

**Goals:**
- Every stored theme document carries `iconAssets: IconAssetKey[]` of length 20, covering every key.
- Preserve any per-theme customization already in the array.
- Idempotent: re-running the backfill is a no-op.
- Runs once per process start, after `ensureThemesSeeded()`.
- Tolerate an empty collection (no-op).

**Non-Goals:**
- No API contract change. The contract is already `iconAssets: string[]` (per `theme-svg-sprite-icons`); this change only fills in stored documents.
- No change to the read-path normalization — it still converts the legacy keyed record to an id list as a safety net.
- No removal of `ICON_ASSETS` imports from the server (the backfill service uses it to validate known keys).

## Decisions

**Run the backfill in the themes service, invoked from `server.ts` after `ensureThemesSeeded()`.**
A dedicated `ThemesService.backfillIconAssets()` method walks every stored theme, computes the canonical id list (`iconAssetKeys` from contracts), and upserts via the existing `replace` contract. The wiring lives in `bootstrap.ts`'s `backfillThemeIcons` helper. This keeps the backfill idempotent, async-safe, and isolated from the read path.
- Alternative: a one-shot admin endpoint. Rejected — requires a manual step and leaves the app in a partial state until it's run.
- Alternative: a Mongo aggregation pipeline at boot. Rejected — adds infra for a one-shot cleanup and is harder to test with `InMemoryThemesRepository`.

**Compute the merged array inside the service, not the repository.**
The repository stays a thin CRUD layer. The backfill logic lives in the service because it knows about `iconAssetKeys` (the canonical contract value).
- Alternative: repository-level upsert that takes a partial. Rejected — splits the "what's a complete icon record" knowledge across two layers.

**Preserve existing keys; only fill missing ones.**
When a stored theme already has an array, the backfill merges the existing array with the canonical list and dedupes. Existing keys are untouched; only missing keys are added. This matches the spec scenario "partially keyed theme document is upgraded without losing customizations".
- Alternative: replace the entire array with `iconAssetKeys`. Rejected — it would clobber any selection an admin made via the `ThemeForm`.

**No ICON_ASSETS artwork at runtime.**
After `theme-svg-sprite-icons`, `ICON_ASSETS` is consulted only at boot to populate the sprite. The backfill service no longer reads per-icon `path`/`viewBox`. It validates known keys against `iconAssetKeys` and emits the canonical array.

## Risks / Trade-offs

- **`ICON_ASSETS` is a frontend module imported by the server.** The design already accepted this for `themeSeed.ts` and `normalizeStoredTheme`; one more server import is consistent. The module is pure data with no runtime dependencies, safe in a Node context.
- **Boot-time cost.** For a few themes this is trivial; for a large collection it scales linearly. If the collection grows into the thousands, the backfill can be batched with a cursor. Not needed today.
- **No automatic re-backfill when new icon keys are added.** When the next change adds a 21st `IconAssetKey`, stored themes won't have it until this backfill runs again at next boot. That's acceptable since `ICON_ASSETS` fills the gap at runtime (the sprite carries the new symbol and the normalization tolerates missing ids).