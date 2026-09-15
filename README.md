# Assessment and Feedback Toolkit

An institution-neutral public toolkit created by Dr Canh Thien Dang, with development assistance from ChatGPT by OpenAI. It helps university educators produce two editable student-facing Word documents:

1. Before assessment: an Assessment and Feedback Guide.
2. After assessment: cohort-level General Feedback suitable for KEATS or another learning platform.

Public-source GitHub Pages edition:

- Repository: <https://github.com/canhthiendang/assessment-feedback-toolkit>
- Website: <https://canhthiendang.github.io/assessment-feedback-toolkit/>

The GitHub Pages edition is deliberately static and local-only. It retains the manual and ChatGPT-assisted routes, browser draft storage, JSON import, editable Word generation, optional KCL document branding and SPO email preparation. It does not include the usage-reporting API, database or private owner dashboard. Form entries and generated documents are processed in the user's browser.

The source is publicly visible for transparency. No open-source licence has yet been selected, so public visibility should not be interpreted as granting unrestricted rights to redistribute the code. Colleagues may use the hosted toolkit subject to their own institutional requirements.

## Main workflows

- Manual and ChatGPT-assisted routes for both documents.
- The ChatGPT route asks colleagues to use approved syllabus, course aims or learning outcomes, assessment brief, marking guide and rubric sources, with clear safeguards for restricted and identifiable material.
- Each ChatGPT route includes a fictional JSON example that can be copied or loaded into the response box to demonstrate automatic field completion.
- AI prompts request pedagogically differentiated illustrative answer tiers, aligned to supplied criteria and framed as feedback for learning rather than official model answers.
- Examination-heavy, mixed-assessment and coursework-only module profiles.
- Format-aware examples for examinations, essays/reports, problem sets, data projects, cases, presentations, group projects and take-home work.
- Generic Word branding for external colleagues and optional KCL Word branding using the supplied KCL logo and accessible red palette.
- Optional SPO handover checklist and prepared email covering approved revision materials.
- Local browser draft storage; nothing is published automatically.

## Privacy boundary

- Form content, documents and local drafts remain in the user's browser/computer.
- The site never receives a syllabus or ChatGPT credentials. In the AI route, the user works directly in their own ChatGPT account.
- Users are instructed not to enter identifiable student data, individual scripts, raw marks, named comments or identifiable student work.
- Optional usage reporting is opt-in and records only faculty, department, document stage, route, broad profile, format, academic period and event date after successful generation.
- Usage events contain no name, email, module identifier, form content, document, ChatGPT content or persistent visitor identifier. They are retained for up to 24 months.
- The authenticated owner dashboard shows monthly aggregates and suppresses cells below five. Counts are document-generation events, not unique users.

Production uses the `ADMIN_CHATGPT_USER_ID` environment value to restrict `/admin` and its reporting API to the authorised owner account.

## Development and verification

- `pnpm dev` starts the local site.
- `pnpm exec tsc --noEmit` checks TypeScript.
- `pnpm lint` runs the source checks.
- `pnpm build` creates the Sites deployment build and packages D1 migrations.
- `pnpm build:pages` creates the static, local-only GitHub Pages edition in `dist-github-pages`.
- `pnpm db:generate` regenerates the D1 migration after schema changes.
- `scripts/generate-docx-samples.ts` creates four representative validation documents after bundling.
- `scripts/smoke-test.mjs` verifies the sample DOCX archives.

Four representative documents—before/after and generic/KCL—are retained locally under `artifacts/validation-docx`. Every page was rendered and inspected. All four passed the Word accessibility audit with zero high-, medium- and low-priority findings.

## Continuation notes

- Keep the public website institution-neutral. Use the KCL mark only in the explicitly selected KCL Word output.
- Treat examples as editable suggestions rather than policy wording.
- Do not weaken the analytics allowlist, 24-month purge, small-cell suppression or owner-only authorization.
- Confirm required institutional privacy/IT approval before treating optional analytics as an approved institutional service.
