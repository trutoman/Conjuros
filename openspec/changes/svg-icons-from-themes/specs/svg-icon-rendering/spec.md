## Purpose

Renders every interactive UI icon as an inline SVG sourced from the active theme, eliminating text glyph characters across the interface.

## ADDED Requirements

### Requirement: Interactive icons are rendered as inline SVGs

The system SHALL render every interactive icon — theme toggle light/dark, add-item button, and all close buttons — as an inline `<svg>` element with an accessible label, never as a text glyph character. The SVGs SHALL preserve the visual size of the icons they replace. Each SVG SHALL use a single `<path>` element carrying the icon's path data.

#### Scenario: No text glyphs remain in interactive controls

- **WHEN** a user inspects the rendered interface
- **THEN** the theme toggle, add-item buttons, and close buttons contain inline SVG icons instead of the `☀`, `☾`, `+`, and `✕` text characters

#### Scenario: SVG icons keep the previous size

- **WHEN** glyphs are replaced with SVG icons
- **THEN** the rendered icons match the visual dimensions of the glyph forms they replace

#### Scenario: Icons are accessible

- **WHEN** a screen reader encounters an interactive icon button
- **THEN** the accessible name comes from an `aria-label`, and decorative SVG markup is hidden from assistive technology

### Requirement: Icons are driven by the active theme

The SVG path and viewBox rendered for an icon SHALL come from the active theme's icon definitions. When the active theme does not define the icon for a given key, the renderer SHALL fall back to the built-in default definition for that key, and the interface SHALL continue to function.

#### Scenario: Icon path comes from the active theme

- **WHEN** the active theme defines an SVG path for an icon key
- **THEN** the rendered SVG uses that theme's path and viewBox

#### Scenario: Missing icon falls back to the default

- **WHEN** the active theme does not define an icon for a rendered key
- **THEN** the built-in default SVG definition is rendered

#### Scenario: Changing theme changes the icon

- **WHEN** the active theme changes its icon definition
- **THEN** the rendered SVG for that key reflects the new definition

## DELETED Requirements

### Requirement: Icon assets are a list of keys

**Reason**: Replaced by keyed icon definitions so each theme stores the actual SVG path and viewBox it renders, rather than only declaring which keys it uses.
**Migration**: Existing stored themes' `iconAssets` arrays are migrated to keyed definitions or normalized at load time; any key without a stored definition falls back to the built-in default.