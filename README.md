# KBS Module Assessment and Feedback Guide Generator

A browser-based Phase 1 tool that standardises module assessment and feedback guidance without sending form data or syllabus files to a server.

Current hosted version: <https://kbs-module-guide-generator.maian6396.chatgpt.site>

## What colleagues can do

1. Choose an examination-heavy, mixed-assessment or coursework-only profile.
2. Enter module details and optionally select a local syllabus or outline.
3. Complete prompts tailored to the assessment profile.
4. Review the guide and download an editable Word document.
5. Optionally prepare an email to an SPO, with the Programme Director copied.

The email workflow downloads the Word document and opens a prepared email. Browsers cannot attach a local file automatically, so the colleague must attach the downloaded document before sending.

## Privacy boundary

- All Phase 1 form data stays in the browser and is saved only in local browser storage.
- The syllabus selector records the filename for the output but does not read or upload the document.
- Users are instructed not to enter identifiable student information or upload student work.

## Recipient configuration

The SPO recipient and optional Programme Director CC are entered on the final screen. To preconfigure them later, set `DEFAULT_SPO_EMAIL` and `DEFAULT_PD_CC` near the top of `app/page.tsx`.

## Development and verification

- `pnpm dev` starts the local site.
- `pnpm build` creates the production build.
- `pnpm exec tsc --noEmit` runs the TypeScript check.
- `scripts/smoke-test.mjs` verifies Word generation for all three assessment profiles after bundling `app/docx-generator.ts` for Node.

The final examination-heavy, mixed-assessment and coursework-only sample documents were rendered page by page for visual inspection. Each also passed the document accessibility audit with no high-, medium- or low-priority findings.

The generated Word document follows the `compact_reference_guide` design preset with a restrained operational-pack opening: US Letter, 1-inch margins, Calibri 11 pt body text, 1.25 line spacing, fixed-width metadata table geometry and quiet page numbering.
