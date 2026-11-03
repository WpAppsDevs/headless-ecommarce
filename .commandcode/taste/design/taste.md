# design
- Change only visual presentation; do not touch logic, data fetching, or cart/wishlist behavior. Confidence: 0.70
- Use Playfair Display (serif) for headings/titles and Inter (sans-serif) for body and small UI text, scoped to the section via a CSS variable without changing the site's global font. Confidence: 0.70
- Brand palette: navy #1F2A3C for icons/chevrons/primary text, crimson #9E2F45 for links and selected states. Confidence: 0.70
- Force lining numerals on all serif text (`font-variant-numeric: lining-nums`, fallback `font-feature-settings: "lnum" 1`). Confidence: 0.70
- Prefers user-facing copy and UI text in Bengali (Bangla) rather than English. Confidence: 0.85
- Prefers visual consistency across similar pages: when updating one page's UI/UX, match the shared design components/layout already used by its sibling pages rather than a bespoke look. Confidence: 0.8
- When a request is scoped to UI/UX only, preserves all existing content and section numbering; does not alter copy unless asked. Confidence: 0.8
- Prefers section headings (h2) without numeric/numbered prefixes — when asked, strips numbering like "১." from headings rather than keeping numbered sections. Confidence: 0.7
- Prefers contact sections to include a WhatsApp messaging link (wa.me) as a contact channel, mirroring the existing Returns/Exchange page. Confidence: 0.7
