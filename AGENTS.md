## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo (local markdown). Create `.scratch/` on first use; it is not checked in and may not exist yet. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Codebase docs

Read `docs/coding-standards.md` before changing code, `docs/design-system.md` before changing colour, type, spacing or any UI surface, and `docs/architecture.md` before changing data flow, auth, or routing. Read `docs/operations.md` before opening a pull request or changing CI. The maintained documentation index is `docs/README.md`. The code is the source of truth; update the docs in the same change when behavior moves.

### Working style

Run long commands (`npm run build`, `npm run verify:full`) in the background and continue with other work; the harness reports completion, so read the final output once.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
