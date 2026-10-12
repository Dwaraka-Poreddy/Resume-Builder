# PDF export diagnosis and regression checks

The supplied failing PDF was produced by Microsoft Print to PDF. It contained no text operators, font resources, extractable characters, or link annotations: its letters were drawing paths. Chrome's native PDF renderer preserved the same resume's text and all five links. Typography alone did not reproduce the loss. This comparison implicates the printer path; it does not establish when earlier application PDFs changed or their effect on hiring decisions.

## Git history

The local checkout was initially at 1df619a. Fetching origin exposed 09e70e6 (12 October 2026), which is the deployed multi-page implementation. That commit removed the old auto-fit iteration budget and allowed the fit scale to both grow and shrink during each layout effect. The observed live #185 stack points into that measurement callback. Existing commits use window.print; no commit has been established as the cause of the outlined PDF.

The fix retains the newer pagination and DOCX sizing. Auto-fit now shrinks monotonically within an edit, is bounded to 24 passes, preserves the 9pt floor, and resets for a new resume value. Resize/font notifications read the current measurement callback and are scheduled on an animation frame.

## Export behavior

PDF opens guidance to select the browser's Save as PDF destination, then prints a separate same-origin iframe containing actual resume DOM text and anchors. It waits for styles and fonts, excludes the hidden measurement copy and warning, and applies margins on each printed page. Editor zoom and clipping containers are excluded. Printer destination remains a user choice; browser JavaScript cannot enforce Save as PDF.

## Validation

- 12 Node tests cover JSON import/export, pagination, and fit convergence/readability limits.
- TypeScript, changed-file lint, and the production build must pass.
- Browser fixture: run `node node_modules/vite/bin/vite.js --config tests/vite.resume.config.ts`, then open `http://127.0.0.1:4174/tests/resume-preview.html`. Check long content, shortened content, and the fit toggle.
- For an actual exported JSON fixture, temporarily place it at `tests/.local-resume.json`, use `?fixture=local`, and remove it after testing. Do not commit personal fixture data.
- Rendered PDF checks covered one-page and two-page outputs, extracted resume text through the final award, five link annotations, and no duplicate hidden measurement text. Pages were visually inspected.

These changes are local until deployed. PDF integrity is not an ATS ranking or shortlisting guarantee.
