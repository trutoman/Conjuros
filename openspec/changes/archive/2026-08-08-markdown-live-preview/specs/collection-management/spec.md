## MODIFIED Requirements

### Requirement: Markdown form splits content into editor and viewer panes

The item form for a `markdown` item SHALL render the Content field as a 50/50 vertical split of two panes without a standalone "Content" label row: the left pane SHALL be labeled "Content - Edit" and SHALL be an editable textarea bound to the content value; the right pane SHALL be labeled "Content - View" and SHALL render the Markdown from the edit pane as sanitized HTML. The preview SHALL update in real time as the user types in the edit pane. Both panes SHALL start at twice the default form field height and SHALL grow taller as more lines are added. The rendered preview SHALL be sanitized before display; no script or active content embedded in the Markdown SHALL execute.

#### Scenario: Markdown form shows labeled editor and preview panes

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the Content field renders as two side-by-side panes of equal width
- **AND** the left pane is labeled "Content - Edit" and is an editable textarea
- **AND** the right pane is labeled "Content - View" and shows rendered Markdown
- **AND** no separate "Content" label row is rendered above the panes

#### Scenario: Preview renders markdown as the user types

- **WHEN** a user types Markdown into the "Content - Edit" pane
- **THEN** the "Content - View" pane renders the text as formatted HTML (for example, `# Heading` renders as a heading)
- **AND** the preview updates as the user continues typing

#### Scenario: Rendered preview does not execute embedded scripts

- **WHEN** the content value contains a script or other active HTML element
- **THEN** the preview shows the element as inert text or markup
- **AND** no script embedded in the content executes

#### Scenario: Content panes render at double the default height

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the edit textarea and the preview pane render at twice the height of a default form field

#### Scenario: Content panes grow with added lines

- **WHEN** a user adds more lines to the "Content - Edit" textarea
- **THEN** the edit textarea and the preview pane grow taller to fit the additional content
