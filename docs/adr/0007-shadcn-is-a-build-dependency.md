# ADR-0007: shadcn is a build-time dependency

## Status

Accepted.

## Context

`shadcn` contributes one stylesheet, imported by `globals.css`, and no runtime JavaScript. It was declared in `dependencies`, so production installs carried its CLI and MCP/Express toolchain, and dependency scanners classified that build tooling as runtime risk. After the shadcn 4.23 upgrade the application itself had no high or critical runtime advisories, but the production audit still reported the build-only tree.

## Decision

`shadcn` is a `devDependency`. A host that builds the application must install dev dependencies; a production-only install is valid only after the build, when serving the prebuilt output.

## Consequences

- `npm ci` is the build-time install. `npm ci --omit=dev` is for runtime images and hosts that serve an existing `.next` build.
- `npm run build` must run before dev dependencies are pruned; it resolves `shadcn/tailwind.css`.
- The production audit covers only code that ships. After the move, `npm audit --omit=dev` reports zero findings; the remaining 13 advisories are development-only.
- Verified after the move: a clean `npm ci` plus `npm run verify:full` built successfully and resolved the stylesheet, and a production-only install served `/` and `/products` with HTTP 200.
- A self-hosted pipeline that runs `npm ci --omit=dev` before `npm run build` will fail to resolve the stylesheet. Keep a build stage with dev dependencies, then prune for the runtime stage.
- Future audit noise from shadcn's CLI toolchain is development-only and does not gate release decisions.

## Related

- [operations.md](../operations.md)
- [getting-started.md](../getting-started.md)
- [design-system.md](../design-system.md)
