## 1. Package Manager Migration

- [x] 1.1 Remove `package-lock.json` from root
- [x] 1.2 Add `pnpm-lock.yaml` lockfile via `pnpm install`
- [x] 1.3 Add `pnpm-workspace.yaml` workspace configuration
- [x] 1.4 Update `package.json` scripts to use pnpm commands (replace `npm` with `pnpm`)

## 2. Dockerfile Updates

- [x] 2.1 Update API Dockerfile: change `npm ci` to `pnpm install`
- [x] 2.2 Update Web Dockerfile: change `npm ci` to `pnpm install`
- [x] 2.3 Update docker-compose references if needed

## 3. Verification

- [x] 3.1 Run `pnpm install` and verify all dependencies resolve
- [x] 3.2 Run existing test suite to confirm no behavioral changes
- [x] 3.3 Verify `pnpm --version` shows pnpm is available
- [x] 3.4 Check that `package-lock.json` is not used by any scripts