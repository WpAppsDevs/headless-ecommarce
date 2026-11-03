# coding

- Prefers the smallest reliable fix that does not break unrelated functionality and preserves existing UI/design and error/success styling. Confidence: 0.85
- Distinguishes between distinct error conditions (not found vs email mismatch vs auth/API failure vs network error vs invalid input vs missing info) and avoids masking server/API/auth errors as "not found". Confidence: 0.85
- Values secure data exposure: verifies both an order identifier and the customer billing email match before returning order data (never exposes an order by ID alone). Confidence: 0.85
- For display-only requests (e.g., updating displayed prices/text), keeps the change display-only and does not implement calculations, backend logic, checkout behavior, or other unrelated functionality unless explicitly asked. Confidence: 0.8
- Prefers accessible interactive UI: real <button> toggles with aria-expanded/aria-controls, panels with a matching id and role="region", Enter/Space keyboard support, and visible focus styles. Confidence: 0.8
- Respects prefers-reduced-motion by disabling or minimizing animations/transitions. Confidence: 0.8
- Builds mobile-first: content stays readable on small screens and interactive touch targets are at least 44px tall. Confidence: 0.7
- Avoids adding new libraries/dependencies unless the project already uses one for the feature. Confidence: 0.7
- Prefers filtering at the data/query level (so counts and pagination stay correct) rather than only hiding rows in the UI. Confidence: 0.8
- Adds a defensive front-end filter as a backstop even when the data layer already filters. Confidence: 0.7
- Hides missing or unknown data (e.g., absent timestamps) instead of showing wrong, copied, or fabricated values. Confidence: 0.7
- Does not delete or modify stored records or change admin-side behavior; scopes changes to customer-facing views only. Confidence: 0.7
