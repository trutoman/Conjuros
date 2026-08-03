# Research: Tag Match Mode Segmented Toggle

**Date**: 2026-08-02 | **Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Research Tasks

### 1. Segmented Toggle Pattern — Reusing ThemeToggle Design

**Decision**: Create a new `TagMatchToggle` component that mirrors `ThemeToggle`'s structure but with its own props interface, rather than creating a generic shared toggle.

**Rationale**: `ThemeToggle` is a 20-line component with `ThemePreference`-typed props. The tag match toggle has a different type (`'all' | 'any'`), different labels ('OR'/'AND'), and different ARIA semantics. A generic wrapper would add unnecessary abstraction for two instances. If a third segmented toggle appears in the future, a shared component can be extracted then.

**Alternatives considered**:
- Generic `SegmentedToggle<T>` component — Over-engineered for two instances with different types. Violates AGENTS.md: "Do not add components, libraries, or animations without a specific need."
- Extending `ThemeToggle` with conditional props — Couples unrelated concerns (theme preference + tag filtering). Poor separation of responsibilities.

### 2. CSS Strategy — Shared vs. Duplicated Styles

**Decision**: Add a `.tag-match-toggle` CSS class that reuses the exact same property values as `.theme-toggle`. Remove the obsolete `.match-mode-selector` styles.

**Rationale**: The `.theme-toggle` and `.tag-match-toggle` share identical visual design (border, border-radius, padding, active states). Duplicating the rules keeps each class self-contained and avoids coupling sidebar styling to topbar styling. The rule sets are small (< 15 lines each), so duplication is acceptable.

**Alternatives considered**:
- Shared `.segmented-toggle` base class — Would require refactoring `ThemeToggle.tsx` to use the new class name. Introduces unnecessary churn for two small rule sets.
- CSS custom properties for toggle tokens — Over-engineered; the existing `--primary`, `--border`, `--surface`, `--text` variables already provide theming.

### 3. ARIA Semantics for Toggle Group

**Decision**: Use `role="group"` with `aria-label="Tag match mode"` on the container, and individual `aria-label` + `aria-pressed` on each button. This mirrors `ThemeToggle`'s ARIA pattern.

**Rationale**: WAI-ARIA best practices for segmented controls recommend `role="group"` for semantic grouping. Native `<button>` elements with `aria-pressed` provide toggle semantics that screen readers announce correctly. This is the same pattern already proven in `ThemeToggle`.

**Alternatives considered**:
- `role="radiogroup"` with `role="radio"` — Semantically valid but requires manual keyboard arrow-key navigation (roving tabindex). The existing `ThemeToggle` uses buttons, so consistency is preferred.
- `role="toolbar"` — Intended for groups of unrelated actions, not mutually exclusive options.

### 4. Test Strategy

**Decision**: Create a dedicated `TagMatchToggle.test.tsx` for the new component, and update `Sidebar.test.tsx` to test the new toggle interaction (clicking buttons instead of changing a select).

**Rationale**: Isolated component tests verify props, ARIA attributes, and click handlers. Integration via `Sidebar.test.tsx` verifies the toggle is correctly wired to `filters.tagFilterMode` and `onChange`. The existing test `'triggers onChange callback when match mode selector changes'` must be updated since the `<select>` element is being removed.

**Alternatives considered**: None — this is the standard approach established by `ThemeToggle.test.tsx` and `Sidebar.test.tsx`.

## All NEEDS CLARIFICATION Resolved

No unresolved technical questions remain. All decisions are documented above.
