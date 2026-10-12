# Bullet alignment and editor improvements

In Settings, use Bullet text alignment: Left, Center, Right, or Justify. Justification fills both edges of wrapped bullet text and keeps the final line left-aligned. Experience and standalone bullet sections inherit this global setting. Per-section overrides include Use global, and Reset clears the override.

JSON: data.design.bulletAlign (or design.bulletAlign for raw resume JSON) accepts left, center, right, justify. sections[].bulletAlign optionally overrides it. Older exports default to left; invalid values are rejected. Alignment is retained by JSON, native PDF printing, and DOCX paragraph alignment. The same section CSS is used for measurement and visible pages.

Editor improvements include fit-to-width and 100% preview zoom, responsive panels, sticky Content/Settings tabs, labeled controls, numeric size/spacing inputs with safe draft editing and bounded values, hidden unused side-column controls, confirmation before replacing the whole resume, DOCX progress/error feedback, and save status announcements. Edits made during an in-flight autosave remain dirty and are saved by the next request.

Validation: 14 targeted Node tests, TypeScript, changed-file ESLint and production build pass. Browser checks exercised global justification, section override and reset, numeric input, and 390px mobile preview sizing. A native PDF rendered from the justified DOM retained extractable text and 15 links. Full repository lint also encounters pre-existing formatting errors in untouched files. The authenticated save/reset workflows were code-reviewed and type/build checked; browser interaction used an isolated local component fixture.

Changes are local, not pushed or deployed.
