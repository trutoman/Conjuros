## Context

After `svg-icons-from-themes` shipped, the contract for `Theme.iconAssets` changed from `z.array(iconAssetKeySchema)` to `iconAssetsSchema` (a `Record<IconAssetKey, IconAssetDefinition>`). The themes service still calls `themeSchema.parse(storedTheme)` for every read in `publicTheme`. Documents already stored in MongoDB from previous runs still carry the array shape (`['spell', 'web-link', …]`). Zod rejects the array, the service throws, the global error handler maps the ZodError to HTTP 400, and `useSiteTheme`'s catch branch runs `applyTheme(document.documentElement, null)`, clearing every CSS custom property. The `:root` stylesheet defaults then render the page in their hardcoded "light" values regardless of the user's preference, so the toggle appears inert. The PATCH `/api/auth/me/theme` itself succeeds, so the preference *is* being persisted; the visible breakage is entirely on the read-and-apply side.

## Goals / Non-Goals

**Goals:**
- Make `/api/themes/active` (and every other read) succeed against any theme document whose only deviation from the current schema is the `iconAssets` legacy array shape.
- Return a valid `Theme` whose `iconAssets` is the keyed record; merge each legacy-listed key with the bundled `ICON_ASSETS` defaults so the UI has a `path`/`viewBox` to render.
- Preserve the keyed shape when it's already valid; never double-normalize.

**Non-Goals:**
- No schema change (the contract stays strict).
- No destructive re-seed or manual migration script; the API handles legacy documents transparently.
- No change to the `add-theme-system` or `outline-icons-only` specs.

## Decisions

**Normalize in `publicTheme`, the single read funnel.**
Add a `normalizeStoredTheme` helper that runs before `themeSchema.parse`. If `stored.iconAssets` is an array, convert it to a record keyed by each entry, merging each key with `ICON_ASSETS[key]` (so the legacy list gains the new per-key definition). The helper is the only place that knows about the legacy shape. Every code path (`list`, `get`, `create`, `update`, `activate`, `getActiveForUser`, `getActivePaletteForUser`) flows through `publicTheme`, so a single normalization point covers them all.
- Alternative: a Mongo aggregation pipeline migration at boot. Rejected — adds infra, runs on every boot, and doesn't help if a theme is inserted between boots. The read-time normalization is always correct and costs a single shallow copy per read.
- Alternative: a one-shot `POST /api/admin/migrate-themes` endpoint. Rejected — requires an admin step and leaves the app broken until it's run.

**Default-fill per key from the bundled `ICON_ASSETS`.**
The legacy shape carried only keys. Normalization must therefore fill in `path` and `viewBox` for each listed key. The bundled `ICON_ASSETS` is the canonical source (it's the same map the frontend uses for its per-key fallback), so importing it in the themes service keeps a single source of truth. Unknown keys in a legacy array are skipped (the resulting record omits them, which is safer than fabricating a placeholder).
- Alternative: store a `{ path: '', viewBox: '' }` placeholder for unknown keys. Rejected — produces invalid `Theme` records that fail the downstream parse.

**Don't mutate the stored document on read.**
Normalizing in-place on the repo would write on every GET, racing with concurrent writes and ballooning audit trails. Read-time normalization returns the correct shape; a future one-shot migration can backfill storage separately if desired.
- Alternative: upsert the normalized shape back on first read. Considered — it removes the legacy branch from the hot path long-term, but it makes `publicTheme` async and changes its signature (called widely). Not worth the churn for a one-off cleanup.

## Risks / Trade-offs

- **`ICON_ASSETS` is a frontend module imported by the server.** The design already accepted this for `themeSeed.ts`; adding one more server import is consistent. The module is pure data (a `Record<string, { path, viewBox }>`) with no runtime dependencies, so it's safe in a Node context.
- **Unknown legacy keys are dropped silently.** Acceptable — the bundled `ICON_ASSETS` is the only keyset we ship, so anything outside it is either a typo or a removed key. The frontend's per-key `ICON_ASSETS` fallback covers the visual case.
- **The PATCH `/api/auth/me/theme` is unaffected.** Confirmed by running the live API: the preference persists. The fix is purely on the theme-read path.