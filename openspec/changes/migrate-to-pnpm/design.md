## Context

Current state: project uses npm with `package-lock.json` as lockfile. Migration to pnpm requires updating lockfile, workspace configuration, and build scripts.

## Goals / Non-Goals

**Goals:**
- Replace `package-lock.json` with `pnpm-lock.yaml` as primary lockfile
- Add `pnpm-workspace.yaml` for explicit workspace configuration
- Update all npm scripts to use pnpm commands
- Migrate Dockerfiles from `npm ci` to `pnpm install`
- Ensure zero behavioral changes to API or frontend

**Non-Goals:**
- Change any API endpoints or frontend components
- Modify application logic or data models
- Update external service integrations

## Decisions

- Use pnpm over yarn or npm for its deterministic hoisting and content-addressable store
- Keep `package-lock.json` as fallback/deprecated during transition period
- Update root-level scripts only; preserve per-package scripts unchanged
- Maintain same dependency versions; pnpm should produce identical node_modules

## Risks / Trade-offs

- [ ] Potential hoisting differences could affect sibling package imports - mitigated by testing full monorepo build
- [ ] CI pipelines may need pnpm installation steps added - mitigated by updating CI configs
- [ ] Team members' local workflows will need pnpm adoption - mitigated by documentation and transition period