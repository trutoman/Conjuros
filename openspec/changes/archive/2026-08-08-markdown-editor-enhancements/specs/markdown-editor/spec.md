## Purpose

Provides Markdown-authoring ergonomics for the editor textarea: keyboard indentation, automatic list and quote continuation, auto-closing Markdown pairs, and local draft autosave so work survives an accidental form close.

## ADDED Requirements

### Requirement: Editor indents and dedents with Tab and Shift + Tab

The Markdown editor textarea SHALL treat the Tab key as an indentation action rather than focus traversal: pressing Tab SHALL insert spaces (four spaces) at the cursor, or indent every selected line when there is a selection; pressing Shift + Tab SHALL remove leading whitespace from the current line or every selected line (dedent) rather than moving focus. Pressing Tab with no text SHALL NOT move focus to the next field.

#### Scenario: Tab inserts spaces at the cursor

- **WHEN** a user places the cursor in the Markdown editor and presses Tab
- **THEN** four spaces are inserted at the cursor position
- **AND** focus stays in the editor

#### Scenario: Tab indents selected lines

- **WHEN** a user selects multiple lines in the Markdown editor and presses Tab
- **THEN** each selected line is prefixed with four spaces

#### Scenario: Shift + Tab dedents the current line

- **WHEN** a user places the cursor on an indented line and presses Shift + Tab
- **THEN** the leading four spaces (or as many as available) are removed from that line
- **AND** focus stays in the editor

### Requirement: Editor continues Markdown lists and quotes on Enter

Pressing Enter in the Markdown editor SHALL start a new line that continues the current Markdown list or blockquote: an unordered list (`-`, `*`, `+`), an ordered list (`1.`, `2.`, …), or a blockquote (`>`) SHALL be continued on the new line with the same marker, preserving indentation. Pressing Enter on an empty list item SHALL remove its marker so the user can exit the list. Pressing Enter inside plain text SHALL start a new line with no marker.

#### Scenario: Enter continues an unordered list item

- **WHEN** a user is typing on a line that starts with `- ` and presses Enter
- **THEN** a new line starting with `- ` is created
- **AND** the cursor is placed after the marker

#### Scenario: Enter continues an ordered list with the next number

- **WHEN** a user is typing on a line that starts with `1. ` and presses Enter
- **THEN** a new line starting with `2. ` is created

#### Scenario: Enter on an empty list item exits the list

- **WHEN** a user presses Enter on a list line that contains only its marker
- **THEN** the marker is removed
- **AND** the new line is plain text with no list marker

#### Scenario: Enter continues a blockquote

- **WHEN** a user is typing on a line that starts with `> ` and presses Enter
- **THEN** a new line starting with `> ` is created

### Requirement: Editor auto-indents new lines

A new line created with Enter inside a list or blockquote SHALL preserve the indentation level of the preceding line, so nested lists and quoted blocks indent correctly without manual spaces.

#### Scenario: Nested list indentation is preserved

- **WHEN** a user presses Enter on an indented list line (for example, a line starting with four spaces followed by `- `)
- **THEN** the new line starts with the same indentation followed by the matching list marker

### Requirement: Editor auto-closes Markdown pairs

When a user types an opening Markdown marker, the editor SHALL insert its matching closing marker and place the cursor between the pair. This SHALL apply to `**` (bold), `*`/`_` (emphasis), `` ` `` (inline code), `~~` (strikethrough), `[` (link), `(` (link target), and `>` (blockquote). The editor SHALL NOT auto-close a marker when the text immediately following it is already its closing counterpart (so typing over an existing closed pair does not duplicate it).

#### Scenario: Auto-closes bold pairs

- **WHEN** a user types `**`
- **THEN** the editor inserts `**` and places the cursor between the pair

#### Scenario: Auto-closes emphasis pairs

- **WHEN** a user types `*`
- **THEN** the editor inserts `*` and places the cursor between the pair

#### Scenario: Does not duplicate an existing closing marker

- **WHEN** a user types a marker whose closing counterpart immediately follows the cursor
- **THEN** the editor places the cursor after the existing closing marker instead of inserting another one

### Requirement: Editor autosaves markdown content as a local draft

The item form SHALL save the `markdown` content to `localStorage` as the user types and SHALL restore it when the form is opened again, so content typed in an Add or Edit form survives closing the form without saving. The draft SHALL be scoped to the current form (Add form, or Edit form for a specific item) so drafts for different items do not overwrite each other. When the form is submitted successfully, the draft SHALL be cleared. The user SHALL be able to discard the restored draft and start from the item's saved content.

#### Scenario: Draft is restored after closing without saving

- **WHEN** a user types Markdown into the editor and closes the form without saving
- **THEN** reopening the same form restores the previously typed content

#### Scenario: Successful save clears the draft

- **WHEN** a user submits the item form successfully
- **THEN** the saved draft for that form is removed
- **AND** the next open of the form starts from the saved item content

#### Scenario: Add and Edit drafts do not overwrite each other

- **WHEN** a user has typed a draft in the Add form and separately edits an existing item
- **THEN** the drafts are stored under distinct keys and each form restores its own draft

#### Scenario: User can discard the restored draft

- **WHEN** a restored draft is shown in the editor
- **THEN** the user can discard it and start from the item's saved content
- **AND** showing the "Discard draft" button does not move the editor textarea relative to the preview pane
