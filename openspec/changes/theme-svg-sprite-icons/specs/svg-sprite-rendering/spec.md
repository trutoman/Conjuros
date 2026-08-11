## Purpose

Replaces inline-per-icon SVG rendering with a single SVG `<symbol>` sprite referenced by `<use>`. The theme document declares which symbol ids the theme exposes; the bundled outline `ICON_ASSETS` provides the artwork.

## ADDED Requirements

### Requirement: A single SVG sprite is mounted at the document root

The application SHALL mount exactly one inline SVG sprite at the root of the document. The sprite SHALL contain one `<symbol>` per `IconAssetKey`, each carrying an `id` matching the key, the `viewBox` from the bundled outline `ICON_ASSETS`, and a single `<path>` with the bundled `d` attribute. The sprite element SHALL be hidden (`aria-hidden`, `display:none`, `aria-hidden=true`, `focusable=false`).

#### Scenario: The sprite contains every bundled icon symbol

- **WHEN** the application starts
- **THEN** the document contains exactly one `<svg>` element marked as the sprite (hidden)
- **AND** the sprite contains a `<symbol>` for every `IconAssetKey` (`spell`, `web-link`, `markdown`, `file`, `copy`, `open`, `view`, `download`, `menu`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `search`, `sun`, `moon`, `add`)
- **AND** each symbol's `<path>` matches the bundled `ICON_ASSETS` path for that key

### Requirement: Icons render via `<use>` referencing the sprite

`ThemeIcon` SHALL render an inline `<svg class="icon">` whose only child is `<use href="#{name}" />` referencing the sprite symbol id. The `<svg>` SHALL carry the symbol's `viewBox` so the icon scales correctly, and SHALL adopt `currentColor` for stroke/fill so the icon recolors with the theme.

#### Scenario: An interactive icon is one `<use>` deep

- **WHEN** the application renders an icon via `<ThemeIcon name="spell" />`
- **THEN** the resulting DOM has an `<svg class="icon">` with a single `<use>` child
- **AND** the `<use>` element's `href` is `#spell`

#### Scenario: Icons recolor with the theme

- **WHEN** an icon is rendered and the active theme changes its colors
- **THEN** the icon's visible stroke/fill reflects the new theme colors without re-mounting the sprite

### Requirement: Themes declare which symbol ids they expose

The theme document SHALL carry an `iconAssets` field that is an array of `IconAssetKey` ids the theme exposes. Stored documents whose `iconAssets` is still a per-key `{path, viewBox}` record SHALL be normalized on read to the id list by extracting the record's keys. The active theme's id list SHALL determine which symbols are available for that theme; an icon whose id is not on the list SHALL fall back to the bundled sprite (the bundled sprite is always present).

#### Scenario: An icon's id is in the active theme's id list

- **WHEN** the active theme's `iconAssets` includes `spell`
- **THEN** rendering `<ThemeIcon name="spell" />` shows the sprite symbol for `spell`

#### Scenario: An icon's id is missing from the active theme's id list

- **WHEN** the active theme's `iconAssets` does not include `sun`
- **THEN** rendering `<ThemeIcon name="sun" />` still shows the bundled outline symbol (the bundled sprite is always mounted)

## DELETED Requirements

### Requirement: Theme icon assets store SVG definitions

**Reason**: Replaced by SVG sprite rendering — the artwork is no longer carried in theme documents. Themes now declare only the list of symbol ids the theme exposes, with the sprite itself shipping from the bundled outline source.
**Migration**: Stored documents whose `iconAssets` is a keyed record are normalized on read by taking the keys of the record. The bundled `ICON_ASSETS` continues to be the source of truth for the symbol paths; themes never carry per-icon `path`/`viewBox` fields again.