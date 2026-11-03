# Development Standards & Project Rules

## Existing System First

Before writing any code:

1. Analyze the existing codebase.
2. Analyze the existing architecture.
3. Analyze the existing folder structure.
4. Analyze existing services, helpers, utilities, hooks, components, and APIs.
5. Reuse existing implementations whenever possible.

Do NOT:

* Create duplicate helper functions.
* Create duplicate services.
* Create duplicate API clients.
* Create duplicate business logic.
* Create duplicate React components.
* Introduce a new architecture that conflicts with the current system.

Always extend existing functionality before creating new functionality.

---

## PHP / WordPress Standards

For WordPress and PHP projects:

* Follow WordPress Coding Standards.
* Use proper sanitization and validation.
* Use escaping when rendering output.
* Use nonce verification where applicable.
* Follow existing plugin architecture.
* Follow existing naming conventions.
* Follow existing folder structure.
* Add PHPDoc comments for new classes, methods, and properties.
* Add inline comments for complex logic.

When modifying existing classes:

* Preserve backward compatibility.
* Do not change public APIs unless explicitly required.
* Update PHPDoc when behavior changes.

---

## JavaScript / TypeScript / React / Next.js Standards

For JavaScript, TypeScript, React, and Next.js projects:

* Follow the existing project architecture.
* Reuse existing hooks.
* Reuse existing API clients.
* Reuse existing utility functions.
* Reuse existing layouts and design systems.
* Prefer TypeScript when the project already uses TypeScript.
* Create reusable components when appropriate.
* Avoid duplicate logic across components.

When modifying existing code:

* Keep component APIs consistent.
* Maintain existing patterns and conventions.
* Do not introduce unnecessary dependencies.

---

## Documentation-Driven Development

Before implementing a feature:

1. Search for existing documentation.
2. Search for existing API documentation.
3. Search for existing developer documentation.
4. Use documentation as the primary source of truth.

Documentation should always remain synchronized with the codebase.

---

## Documentation Auto-Update Rules

Whenever any of the following occur:

* New feature added
* Existing feature modified
* Bug fixed
* API endpoint added
* API endpoint removed
* API endpoint modified
* Request schema changed
* Response schema changed
* Authentication flow changed
* Database structure changed

Determine whether documentation updates are required.

If documentation exists, update it immediately.

Never leave documentation outdated.

---

## Documentation File Detection

Automatically check the project root directory for the following files.

Developer Documentation:

* Code Documentation.md
* CODE_DOCUMENTATION.md
* code-documentation.md
* CodeDocs.md

API Documentation:

* API Documentation.md
* API_DOCUMENTATION.md
* api-documentation.md
* ApiDocs.md

Frontend Documentation:

* Frontend Documentation.md
* FRONTEND_DOCUMENTATION.md

Component Documentation:

* Component Documentation.md
* COMPONENT_DOCUMENTATION.md

Architecture Documentation:

* Architecture.md
* ARCHITECTURE.md

If any of these files exist:

1. Read them before implementation.
2. Follow their rules.
3. Update them when required.
4. Keep them synchronized with code changes.

---

## API Documentation Rules

When creating, modifying, or removing API endpoints:

Always update API documentation if an API documentation file exists.

Documentation updates must include:

* Endpoint URL
* HTTP Method
* Purpose
* Authentication requirements
* Request parameters
* Request body
* Response schema
* Error responses
* Example requests
* Example responses

If the endpoint behavior changes:

Update the documentation immediately.

If a field is added:

Document the field.

If a field is removed:

Remove it from documentation.

If a field changes:

Update the documentation.

Never leave API documentation outdated.

---

## AI-Friendly API Documentation

API documentation should be written so that both:

* Human developers
* AI coding agents

can understand how to use it.

For every endpoint include:

* When to use it
* Typical workflow
* Frontend implementation notes
* Common usage examples

---

## Implementation Workflow

For every task:

1. Analyze existing implementation.
2. Analyze documentation.
3. Identify reusable code.
4. Implement the change.
5. Update affected documentation.
6. Verify consistency.
7. Provide a summary of:
   * Files changed
   * Documentation updated
   * Architectural impact
8. Commit and push the latest changes with proper details.
