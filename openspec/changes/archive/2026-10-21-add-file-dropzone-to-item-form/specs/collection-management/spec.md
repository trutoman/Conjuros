## ADDED Requirements

### Requirement: Add item form offers a file drop zone for file items

When the Add item form has kind `file`, it SHALL render a file drop zone beside the tag selector, using the space to the right of the tag pills. The drop zone SHALL accept a single file dragged from the operating system and SHALL also be operable by pointer and keyboard to open a native file picker. It SHALL NOT render for any other item kind, and it SHALL NOT render in the Edit item form.

On receiving a file, the drop zone SHALL set the form's `filename` field to the file's full name including its extension and SHALL set the form's `content` field to the file's text decoded as UTF-8. Both fields SHALL remain editable after loading, and a later drop SHALL replace the previously loaded name and content.

While a file is dragged over the drop zone, the drop zone SHALL show a visible drag-over state. After a successful load, it SHALL expose an accessible status message naming the loaded file. If the file cannot be read, or if more than one file is dropped, it SHALL show a friendly error message and SHALL leave the current filename and content unchanged. File name validation SHALL continue to use the existing `file` item rules when the form is saved.

#### Scenario: Drop zone appears for a new file item

- **WHEN** a user opens the Add item form and selects the `File` item type
- **THEN** a file drop zone renders beside the tag selector
- **AND** the drop zone is visible without opening any additional view

#### Scenario: Drop zone is hidden for other kinds

- **WHEN** a user opens the Add item form and selects `Spell`, `Web link`, or `Markdown`
- **THEN** no file drop zone is rendered

#### Scenario: Drop zone is hidden in the edit form

- **WHEN** a user opens the Edit item form for a `file` item
- **THEN** no file drop zone is rendered
- **AND** the Filename and Content fields show the stored values

#### Scenario: Dropping a text file fills the fields

- **WHEN** a user drags a file named `deploy.log` containing `Started at 09:00\nFinished ok` over the drop zone and drops it
- **THEN** the Filename field contains `deploy.log`
- **AND** the Content field contains `Started at 09:00\nFinished ok`
- **AND** the text is preserved exactly, including line breaks

#### Scenario: The full file name with its extension is used

- **WHEN** a user drops a file named `Release.Notes.TXT`
- **THEN** the Filename field contains `Release.Notes.TXT`
- **AND** the name is neither shortened nor stripped of its extension

#### Scenario: A loaded file can be replaced by another drop

- **WHEN** a file has already populated the Filename and Content fields
- **AND** the user drops a second file
- **THEN** the Filename field contains the second file's name
- **AND** the Content field contains the second file's text

#### Scenario: Choosing a file through the picker fills the fields

- **WHEN** a user activates the drop zone and chooses a file in the native picker
- **THEN** the Filename field contains the chosen file's full name
- **AND** the Content field contains the chosen file's text

#### Scenario: Drop zone is keyboard operable

- **WHEN** a keyboard user focuses the drop zone and activates it
- **THEN** the native file picker opens
- **AND** the drop zone exposes an accessible name describing that it loads a file

#### Scenario: Drag-over state is visible

- **WHEN** a user drags a file over the drop zone
- **THEN** the drop zone shows a visible drag-over state
- **AND** the state clears when the file is dropped or the drag leaves the drop zone

#### Scenario: Loaded file is announced

- **WHEN** a file is successfully loaded into the form
- **THEN** the drop zone exposes a status message containing the file's name
- **AND** the status message is available to assistive technology

#### Scenario: Multiple files are rejected

- **WHEN** a user drops more than one file on the drop zone
- **THEN** the drop zone shows a friendly message explaining that only one file can be loaded
- **AND** the Filename and Content fields keep their previous values

#### Scenario: Unreadable file shows an error

- **WHEN** a dropped or chosen file cannot be read as text
- **THEN** the drop zone shows a friendly error message
- **AND** the Filename and Content fields keep their previous values

#### Scenario: Dropped file name still follows file item rules

- **WHEN** a dropped file name exceeds 128 characters or is otherwise not a valid `file` item filename
- **THEN** the name is placed in the Filename field
- **AND** saving the item reports the existing friendly file filename validation message
