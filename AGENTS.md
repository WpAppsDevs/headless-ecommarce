## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo (local markdown). Create `.scratch/` on first use; it is not checked in and may not exist yet. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Codebase docs

Read `docs/coding-standards.md` before changing code, `docs/design-system.md` before changing colour, type, spacing or any UI surface, and `docs/architecture.md` before changing data flow, auth, or routing. Read `docs/operations.md` before opening a pull request, changing CI, or diagnosing a production 404/401 — its cache section explains why a working endpoint can look broken. Read `docs/localization.md` before changing copy, translation, fonts, or anything language-dependent. The maintained documentation index is `docs/README.md`. The code is the source of truth; update the docs in the same change when behavior moves.

### Working style

Run long commands (`npm run build`, `npm run verify:full`) in the background and continue with other work; the harness reports completion, so read the final output once. `npm run verify:fast` (typecheck, lint, unit tests) is the iteration gate; the pre-commit hook runs it when `git config core.hooksPath .githooks` has been set once. `check:routes` boots its own server, so run `npm run build && npm run check:routes` as one command: the build is the expensive half and runs once.

The Studio WordPress checkout at `/Users/saifulislam/Studio/development/wp-content/plugins/wpappsdev-headless-wrapper-api` intermittently disappears for a few seconds (the Studio mount re-syncs). A command that fails with "no such file or directory" for that path should be retried once with the absolute path before treating it as missing.

When a task needs a credential from the user, ask with the secret tool so the value never enters the transcript; a password pasted into the conversation is a password to rotate.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
