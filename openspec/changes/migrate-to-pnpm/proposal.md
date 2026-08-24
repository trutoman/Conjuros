## Why

Migrating from npm to pnpm provides deterministic dependency resolution, faster installs through a content-addressable store, and a single lockfile format across the monorepo. The existing `package-lock.json` had `peer: true` fields removed, but pnpm offers a cleaner approach with consistent hoisting and better workspace handling.

## What Changes

- Replace `package-lock.json` with `pnpm-lock.yaml` as the primary lockfile
- Add `pnpm-workspace.yaml` for explicit workspace configuration
- Update npm scripts in `package.json` to use pnpm commands
- Migrate Dockerfiles from `npm ci` to `pnpm install`
- Ensure all existing dependencies work identically under pnpm

## Capabilities

### New Capabilities

- `pnpm-workspace-configuration`: New workspace config file enabling consistent dependency management across `packages/*`
- `pnpm-lockfile-integration`: pnpm lockfile replacing npm lockfile for deterministic installs
- `pnpm-script-migration`: Updated npm scripts to use pnpm CLI commands

### Modified Capabilities

- None - no existing spec requirements are changing, only tooling and lockfile format

## Impact

- `package-lock.json` will be removed (or kept as deprecated)
- `pnpm-lock.yaml` and `pnpm-workspace.yaml` added at root
- `package.json` scripts updated to use `pnpm` instead of `npm`
- Dockerfiles updated to use `pnpm install` instead of `npm ci`
- No breaking changes to API or frontend behavior