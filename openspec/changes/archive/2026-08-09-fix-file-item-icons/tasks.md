## 1. Fix File Card Icons

- [x] 1.1 In `src/web/components/ItemCard.tsx`, replace the `file` badge `Icon` path with the exact user-provided document page glyph (`viewBox="0 -960 960 960"`), removing the merged markdown/document path
- [x] 1.2 Update the "View file" action `Icon` to reuse the exact same eye icon path and viewBox used by the "View markdown" action
- [x] 1.3 Update the "Download file" action `Icon` to reuse the exact same download icon path and viewBox used by the "Download markdown" action

## 2. Tests and Verification

- [x] 2.1 Extend `src/web/components/__tests__/ItemCard.test.tsx` so the file badge, "View file", and "Download file" tests assert the icons match the markdown counterparts where the change affects rendered output
- [x] 2.2 Run `npm run check` and resolve any failures