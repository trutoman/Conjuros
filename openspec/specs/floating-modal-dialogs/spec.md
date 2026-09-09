# Floating Modal Dialogs

## Purpose

Defines the shared floating modal pattern used by every secondary window on the collection page, so the item list stays visible at all times and all dialogs open, stack, and dismiss consistently.

## Requirements

### Requirement: Secondary windows open as floating modals over the persistent item list

Every secondary window opened from the collection page SHALL render as a floating modal overlay (backdrop plus dialog panel) above the main content frame. The main content frame SHALL always render the collection subheader (search, filters, Add item button) and the item list states (loading, empty, no-results, error, populated list) underneath any open modal; opening a window SHALL NOT unmount or hide the list. This covers at minimum: Add item / Edit item, Add tag / Edit tag, Manage tags, the markdown/file viewer, Manage themes / theme form, and delete confirmations. Any additional secondary window discovered during implementation SHALL use the same modal pattern instead of replacing the main frame.

#### Scenario: Opening Add item keeps the list visible

- **WHEN** the user clicks the "Add item" button
- **THEN** the item creation form opens as a floating modal
- **AND** the collection subheader and item list remain rendered and visible behind the modal backdrop

#### Scenario: Opening Manage tags keeps the list visible

- **WHEN** the user opens "Manage tags"
- **THEN** the tag management view opens as a floating modal
- **AND** the collection subheader and item list remain rendered and visible behind the modal backdrop

#### Scenario: Opening the markdown viewer keeps the list visible

- **WHEN** the user clicks "View markdown" on a markdown item card
- **THEN** the viewer opens as a floating modal
- **AND** the collection subheader and item list remain rendered and visible behind the modal backdrop

#### Scenario: Closing any window reveals the unchanged list

- **WHEN** the user closes an open modal by any supported means (backdrop click, Escape, Cancel/Close control, successful save)
- **THEN** the modal is removed
- **AND** the same subheader and item list state shown before opening is visible again without a reload

### Requirement: Backdrop click dismisses the topmost modal

Clicking outside the dialog panel (on the backdrop) SHALL close only the topmost open modal without saving or applying changes, revealing whatever was underneath (the previous dialog or the item list). Clicks inside the dialog panel SHALL NOT close the modal and SHALL NOT leak through to elements behind it.

#### Scenario: Clicking outside closes the modal

- **WHEN** the user clicks on the backdrop outside the dialog panel
- **THEN** the topmost modal closes without saving
- **AND** any typed but unsaved input is discarded
- **AND** the item list is shown again unchanged

#### Scenario: Clicking inside the dialog does not close it

- **WHEN** the user clicks inside the dialog panel (form fields, buttons, list rows)
- **THEN** the modal stays open
- **AND** the click is handled by the control inside the dialog only

#### Scenario: Nested dialogs close one level at a time

- **WHEN** the tag creation form is open on top of the Manage tags modal and the user clicks the backdrop
- **THEN** only the tag form closes
- **AND** the Manage tags modal remains open over the item list

### Requirement: Modals support keyboard dismissal and focus management

Each modal dialog SHALL use `role="dialog"` with `aria-modal="true"` and an accessible name. Pressing Escape SHALL close the topmost modal without saving (same as Cancel). Opening a modal SHALL move focus into the dialog, and closing it SHALL return focus to the control that opened it.

#### Scenario: Escape closes the topmost modal

- **WHEN** the user presses Escape with a modal open
- **THEN** the topmost modal closes without saving
- **AND** the underlying list or dialog is revealed unchanged

#### Scenario: Focus enters and leaves the dialog

- **WHEN** the user opens a modal and then closes it
- **THEN** focus moves inside the dialog on open
- **AND** focus returns to the opening control on close

#### Scenario: Dialog is announced to assistive technology

- **WHEN** a user with assistive technology opens a modal
- **THEN** the dialog is announced as a modal dialog with its accessible name (e.g. "Add item", "Manage tags", "View markdown")

### Requirement: Delete confirmation action buttons have visible spacing

The delete confirmation dialog's action buttons ("Delete item" and "Cancel") SHALL render with slight visible horizontal spacing between them instead of sitting stuck together. The spacing SHALL follow the active theme (no hardcoded colors) and SHALL apply to every delete confirmation (collection items, tags, tag categories) since they share the dialog.

#### Scenario: Confirmation buttons are separated

- **WHEN** a user opens any delete confirmation dialog
- **THEN** the "Delete item" and "Cancel" buttons show a visible gap between them

#### Scenario: Spacing holds across delete flows

- **WHEN** a user opens the delete confirmation for a collection item, a tag, or a tag category
- **THEN** the button spacing is present in each case
