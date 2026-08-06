## Why

In the Add/Edit item form, the tag selector currently sits between the Description field and the Command/URL field. Users typically decide the item type and its command first; showing tags before the command field breaks that mental flow and pushes the command box further from the buttons. Moving the tag selector below the command box makes the command entry the last content field before the action buttons.

## What Changes

- Reorder the item form fields so the tag selector renders after the Command/URL field and before the action buttons.
- The visible order becomes: type selector, Title, Description, Command/URL, tags, buttons.
- No fields are added, removed, or renamed; the tag selector keeps its single "Tags" legend and color-coded pill rendering.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `collection-management`: the item form field order changes so the tag selector appears below the Command/URL field and directly above the action buttons.

## Impact

- `src/web/components/ItemForm.tsx`: move the tag `<fieldset>` markup below the Command/URL `FormField`.
- `src/web/components/__tests__/ItemForm.test.tsx`: adjust or add a test asserting the relative order of the command field and the tag selector.
- No API, contract, or data-model changes.
