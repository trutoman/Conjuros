## Purpose

Ensures every icon in the interface uses a single consistent outline (stroke-based) style with no fill, so the icon language is uniform across item cards, actions, search, and navigation.

## ADDED Requirements

### Requirement: All icons render in an outline style

Every SVG icon in the application SHALL render as a line (outline) icon: the icon's visible marks SHALL be drawn with strokes, and the icon SHALL NOT render a filled silhouette. The rendered size of each icon SHALL remain unchanged from its filled form. No interactive icon SHALL use the filled variant.

#### Scenario: No filled icons remain

- **WHEN** a user inspects any icon in the interface
- **THEN** the icon renders as strokes with `fill: none`
- **AND** no element carries the filled icon style

#### Scenario: Outline icons keep their previous size and meaning

- **WHEN** a filled icon is converted to its outline form
- **THEN** the icon occupies the same rendered dimensions and communicates the same action

### Requirement: Icon color comes from the theme

An icon SHALL NOT hardcode its own color; its visible strokes SHALL derive from the theme (via `currentColor` or theme CSS custom properties), so a single icon renders correctly in both light and dark themes.

#### Scenario: Icons follow the active theme color

- **WHEN** the active theme changes
- **THEN** all icons recolor from the theme without any icon-definition change

#### Scenario: No hardcoded icon color

- **WHEN** an icon definition is inspected
- **THEN** it contains no fixed color value — only path data and a viewBox

### Requirement: The filled icon variant is retired

The system SHALL NOT expose a filled icon variant for new or existing icons. Any CSS class or component prop that selected a filled style SHALL be removed once no icon uses it.

#### Scenario: The filled style is unreachable

- **WHEN** all icons are outline
- **THEN** no component requests a filled style and no stylesheet rule provides one
