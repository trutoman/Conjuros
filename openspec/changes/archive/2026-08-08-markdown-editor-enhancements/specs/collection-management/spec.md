## MODIFIED Requirements

### Requirement: Markdown form splits content into editor and viewer panes

The item form for a `markdown` item SHALL render the Content field as a 50/50 vertical split of two panes without a standalone "Content" label row: the left pane SHALL be labeled "Content - Edit" and SHALL be an editable textarea bound to the content value; the right pane SHALL be labeled "Content - View" and SHALL render the Markdown from the edit pane as sanitized HTML. The preview SHALL update in real time as the user types in the edit pane. Both panes SHALL start at twice the default form field height and SHALL grow so that the full content of both panes is always visible: the shared height SHALL follow whichever pane's content is taller, whether the text in the edit textarea or the rendered Markdown in the preview, and neither pane SHALL clip or scroll its content. The edit textarea and the preview pane SHALL always start at the same vertical position: the pane headers SHALL keep equal height whether or not the "Discard draft" button is visible, so the editor is not shifted relative to the preview. The rendered preview SHALL be sanitized before display; no script or active content embedded in the Markdown SHALL execute. The edit pane SHALL provide Markdown authoring ergonomics: Tab SHALL insert or indent with spaces and Shift + Tab SHALL dedent, Enter SHALL continue Markdown lists and blockquotes and preserve indentation, and typing an opening Markdown pair SHALL auto-close it. The form SHALL autosave the Markdown content as a local draft in `localStorage` while typing and restore it when the form is reopened, clearing it on a successful save.

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

#### Scenario: Content panes grow to fit the rendered preview

- **WHEN** the rendered "Content - View" preview is taller than the "Content - Edit" textarea (for example, when wrapping or block formatting produces more vertical space)
- **THEN** both panes grow taller so the full preview remains visible
- **AND** the edit textarea grows to match the preview height

#### Scenario: Pane headers keep the editor and preview top-aligned

- **WHEN** a draft exists so the "Discard draft" button is visible in the "Content - Edit" pane header
- **THEN** the edit textarea and the preview pane still start at the same vertical position
- **AND** the "Content - Edit" and "Content - View" pane headers have equal height

#### Scenario: Editor indents and dedents lines

- **WHEN** a user presses Tab in the "Content - Edit" pane
- **THEN** the current line or selection is indented with spaces
- **AND** pressing Shift + Tab dedents the current line or selection

#### Scenario: Enter continues Markdown lists and quotes

- **WHEN** a user presses Enter on a Markdown list item or blockquote in the "Content - Edit" pane
- **THEN** the new line continues with the matching list or quote marker and preserves the indentation of the previous line

#### Scenario: Markdown pairs auto-close

- **WHEN** a user types an opening Markdown marker (for example, `**`, `*`, `` ` ``, or `[`) in the "Content - Edit" pane
- **THEN** the matching closing marker is inserted and the cursor is placed between the pair

#### Scenario: Markdown draft is restored and cleared

- **WHEN** a user types Markdown content and closes the form without saving
- **THEN** reopening the form restores the typed content from the local draft
- **AND** after a successful save the draft is cleared
