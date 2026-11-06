# Domain docs

This repository has one domain context. Its language and decisions live in two places at the root.

## Before exploring

- Read `GLOSSARY.md` for the project's terms.
- Read the ADRs in `docs/adr/` that touch the area you are about to change.

`/domain-modeling` creates or updates these files lazily when a term or decision actually gets resolved. Missing files are not a setup error.

You are ready to explore when every term in your task is defined in `GLOSSARY.md` and you have read the ADRs that touch the area.

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in `GLOSSARY.md`. If a concept is missing, either use the project's existing language or note a real gap for `/domain-modeling`.

## Flag ADR conflicts

When your output contradicts an existing ADR, say so explicitly:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
