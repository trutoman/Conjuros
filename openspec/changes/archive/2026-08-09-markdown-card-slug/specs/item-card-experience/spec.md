## MODIFIED Requirements

### Requirement: Markdown item cards render the content

An item card for a `markdown` item SHALL display a "Markdown" type badge with a distinct icon and SHALL show a single-line slug of the item's `content` as the inline content, keeping the card to a single row like spell and web-link cards. The slug SHALL be derived from the first non-empty line of `content`, with markdown formatting stripped (headings, emphasis, links, inline code, list markers, images) and whitespace collapsed. A markdown card SHALL NOT offer the spell "Copy command" action or the web-link "Open link" action, and the full `content` SHALL remain stored and editable unchanged.

#### Scenario: Markdown card shows badge and content slug

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Markdown" type badge
- **AND** the card displays a single-line slug of the item's `content` as the inline content

#### Scenario: Markdown card stays on a single row

- **WHEN** a `markdown` item has multi-line content
- **THEN** the card's inline content shows only the slug of the first non-empty line
- **AND** the card occupies a single row like spell and web-link cards

#### Scenario: Slug strips markdown formatting

- **WHEN** the first non-empty line of `content` contains markdown (for example, a heading `# Heading` or emphasis `**bold**`)
- **THEN** the inline content slug shows the plain text without the markdown markers

#### Scenario: Slug skips empty leading lines

- **WHEN** the `content` starts with blank lines before the first non-empty line
- **THEN** the inline content slug is derived from that first non-empty line

#### Scenario: Markdown card omits kind-specific actions

- **WHEN** a user views a `markdown` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown

#### Scenario: Full markdown content remains unchanged

- **WHEN** a `markdown` item is edited after its card shows a slug
- **THEN** the full original `content` is still stored and editable
