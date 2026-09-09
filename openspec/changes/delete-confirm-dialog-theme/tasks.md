## 1. Theme the delete confirmation

- [x] 1.1 Swap hardcoded colors in `.confirm-dialog` (`src/web/index.css`) for theme variables: `background: var(--surface)`, `border: 2px solid var(--border-strong)`, `color: var(--text)`; keep selector specificity and all other declarations
- [x] 1.2 Add a frontend regression test asserting the delete confirmation resolves its surface/border/text to the theme variables with no hardcoded hex remaining

## 2. Validation

- [x] 2.1 Run `npm run check` (lint → test → build) and fix regressions
- [x] 2.2 Manually verify: open a tag and a tag-category delete confirmation under a non-default theme — dialog matches the page; default theme still looks light and consistent
