## 1. Align Sidebar Clear Icon Color

- [x] 1.1 Remove any clear-button-specific icon color override so it uses the neighboring theme-derived control color.
- [x] 1.2 Add or update tests to verify the clear icon's theme-consistent color and unchanged clear action.

## 2. Compact the Narrow Topbar Tags Button

- [x] 2.1 Hide the visible Tags label at the narrow viewport breakpoint while preserving the accessible name, expanded state, and panel association.
- [x] 2.2 Add or update responsive tests to verify icon-only narrow presentation and unchanged wide layout and drawer behavior.

## 3. Verify

- [x] 3.1 Run the relevant tests and `npm run check`; resolve failures caused by this change.
