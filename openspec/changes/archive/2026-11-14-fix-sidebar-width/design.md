# Design

## Context

See proposal.md and the capability delta. `.app-sidebar` is a flex item with `width: auto`, `max-width: 280px`, `flex-shrink: 0`, and width/max-width transitions. The collapsed state only lowers `max-width` to 70px, and the mobile media query sets the drawer to `width: 280px; max-width: 280px`. `.tags-sidebar` is a block-level flex column, so it already fills its parent's width.

## Goals / Non-Goals

**Goals:**

- One predictable expanded width (the current 280px maximum) for every tag list.
- Preserve collapse (70px) and the narrow drawer (280px).

**Non-Goals:**

- Changing the sidebar's collapsed width, breakpoint, drawer behavior, or internal padding.
- Making the width configurable or responsive between breakpoints.

## Decisions

**1. Fixed width instead of an auto width with a cap**

Replace `width: auto` with `width: 280px` on `.app-sidebar`, keeping `max-width: 280px` (and the collapsed `max-width: 70px`). Keeping `max-width` leaves the collapse animation intact: the expanded rule targets 280px and the collapsed rule caps the rendered box at 70px. A `flex: 0 0 280px` basis would work too, but the explicit width plus the existing `flex-shrink: 0` is the smaller change.

**2. Content wraps rather than widening the panel**

Tag pills already wrap through the sidebar's normal block flow; the fixed width simply gives them a stable line length. Long tag names wrap instead of stretching the panel, which is why no `overflow-x` rule is added.

**3. No component change**

`Sidebar` renders the panel inside `.app-sidebar` without width logic, and the theme does not set widths, so the stylesheet is the only surface to change.

## Risks / Trade-offs

- **A narrow-but-empty sidebar now reserves 280px.** → Intended: the collection column no longer shifts, at the cost of unused space when there are few tags.
- **Medium-width screens lose horizontal room to the collection.** → The width equals the previous maximum, so no layout gets less space than it could already receive today.
- **The transition could look uneven because only `max-width` changes on collapse.** → Existing behavior is preserved; the width transition still runs from 280 to 70 through the cap.

## Migration Plan

One stylesheet edit shipped with the web bundle; rollback is a revert.
