# Proposal

## Why

The expanded tags sidebar sizes itself to its contents up to a 280px maximum (`width: auto` plus `max-width: 280px`). With few tags it renders narrower than with many, so the collection column shifts horizontally whenever the tag list changes and the sidebar never settles at a predictable width.

## What Changes

- Fix the expanded tags sidebar width at its current maximum (280px), independent of how many tags, categories, or how long the tag names are.
- Keep the collapsed state at its current 70px and the narrow-viewport drawer at 280px.
- Let tag pills wrap inside the fixed width so a long tag name never causes horizontal overflow.

## Capabilities

### New Capabilities

<!-- None: sidebar layout is already covered. -->

### Modified Capabilities

- `collection-layout-and-navigation`: the expanded tags sidebar must keep one fixed width instead of sizing to its content.

## Impact

- Styles only: `src/web/index.css` replaces the content-driven width of `.app-sidebar` with a fixed 280px, keeping the collapsed override and the mobile drawer width.
- No component, contract, API, or data changes.
- Tests: existing sidebar and collection tests are unaffected; verification adds browser measurements of the rendered width with an empty, a short, and a long tag list, plus the collapsed and drawer states.
