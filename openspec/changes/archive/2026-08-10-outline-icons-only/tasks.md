## 1. Audit and convert icon definitions

- [x] 1.1 Review every entry in `src/web/lib/iconAssets.ts` (`ICON_ASSETS`) and replace filled Material-style paths with stroke-based outline variants (same meaning, stroke-rendered)
- [x] 1.2 Review `THEME_MANAGEMENT_ICONS` (palette icon) and convert to an outline variant
- [x] 1.3 Verify inline SVG usages outside `iconAssets.ts` (`UserWidget.tsx`, `TagColumnIcon.tsx`, search icons in `CollectionPage.tsx`/`TagsPage.tsx`) use outline paths

## 2. Unify rendering

- [x] 2.1 Remove the `filled` prop from `ItemCard.tsx`'s `Icon` component and all `filled` usages, so item-action icons render with the outline `.icon` style
- [x] 2.2 Remove the `filled` prop from `TagList.tsx`'s icon component and its usages
- [x] 2.3 Switch the search icons in `CollectionPage.tsx` and `TagsPage.tsx` from `icon icon-filled` to `icon`
- [x] 2.4 Remove the `.icon.icon-filled` rule from `src/web/index.css` and confirm nothing references `icon-filled`

## 3. Reconcile with related work

- [x] 3.1 If `svg-icons-from-themes` has landed, update theme seeds (`src/api/repositories/themeSeed.ts`) so stored icon definitions are the outline variants; if it has not landed, note the outline requirement for its implementation
- [x] 3.2 Reconcile with the archived `item-card-experience` spec: update the file/view/download icon usage to outline variants and adjust any test asserting exact filled paths, recording that `icon-style` supersedes the pinned-path constraints

## 4. Tests and validation

- [x] 4.1 Update component tests that reference `icon-filled` or filled rendering
- [x] 4.2 Add a test asserting no rendered icon carries the filled style (e.g., no `icon-filled` class) and that icons render with stroke-based styling
- [x] 4.3 Run `npm run check` and confirm lint, tests, and build pass
- [x] 4.4 Visually verify in the running app (light and dark themes) that all icons render as line icons at their previous sizes