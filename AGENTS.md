## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo (local markdown). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Codebase docs

Read `docs/coding-standards.md` before changing code and `docs/architecture.md` before changing data flow, auth, or routing. The maintained documentation index is `docs/README.md`. The code is the source of truth; update the docs in the same change when behavior moves.
