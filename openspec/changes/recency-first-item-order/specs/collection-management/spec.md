# Spec Delta

## ADDED Requirements

### Requirement: New and saved items lead the collection

Creating an item SHALL place it above every other item of the owner. Saving an item that has no manual position SHALL also move it above every other item. Both placements SHALL be reflected by the default `order` sort, so the first page shows the newest activity and existing manual positions may shift down as a result.

#### Scenario: A new item becomes the first row

- **WHEN** a user with existing items creates an item
- **THEN** the new item appears above every other item of that user
- **AND** the former first item moves down one position

#### Scenario: Saving an item moves it to the top

- **WHEN** a user saves changes to an item that was never manually reordered
- **THEN** that item becomes the first row of the collection
- **AND** items above it move down one position

#### Scenario: The first page shows the newest work

- **WHEN** a user opens the collection after creating or saving an item
- **THEN** the first page lists that item before the older ones
- **AND** the range counter starts at the first item

### Requirement: A manual reorder fixes an item's position

A manual reorder SHALL place the item at the requested position and mark it as manually placed. Later saves of that item SHALL keep its position regardless of its updated timestamp. The position SHALL still shift down when other items are created or saved above it, and reordering it again SHALL set a new fixed position.

#### Scenario: A saved manually placed item keeps its place

- **WHEN** a user drags an item to position 7 and later saves changes to that item
- **THEN** the item stays at position 7

#### Scenario: New items push a manual position down

- **WHEN** a manually placed item occupies position 7 and the user then creates another item
- **THEN** the manually placed item moves to position 8
- **AND** it keeps its position relative to the other manually placed items

#### Scenario: Reordering again replaces the fixed position

- **WHEN** a user moves an already manually placed item to position 2
- **THEN** the item occupies position 2
- **AND** later saves of that item keep it at position 2

#### Scenario: Manual placement survives editing other items

- **WHEN** a user saves a different item that sits below the manually placed one
- **THEN** the saved item moves above it
- **AND** the manually placed item shifts down without losing its manual state
