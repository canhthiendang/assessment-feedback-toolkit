# Assessment & Feedback Slides Pilot — Implementation Report

Date: 21 September 2026

## Changes made

- Preserved the existing Generic Assessment Guide and After Assessment workflows.
- Added an off-by-default `Assessment & Feedback Slides (Pilot)` option inside the Before Assessment route.
- Reproduced the supplied three-slide template’s exact slide dimensions, section order, headings, two-column structure, colour treatment and Graduate Success Profile graphic.
- Added an editable `.pptx` output and a matching editable `.docx` companion document.
- Added pilot-specific fields for sourced learning outcomes, assessment rationale, evaluation criteria, fairness and clarity, feedback use, skills and employability, preparation, pitfalls, practice opportunities and unresolved information.
- Revised all AI prompts to ask for approved source uploads, prohibit invented module facts and learning outcomes, leave unsupported facts blank, list material gaps, and label general pedagogical suggestions as `[AI suggestion - verify]`.
- Added a final confirmation requiring module leaders to verify module facts and learning outcomes against approved documentation.
- Extended the optional non-static usage-event design with institution, faculty, department, module level and output type. It excludes uploaded files, generated outputs, module identifiers, assessment content, learning outcomes, student data and persistent user identifiers.
- Added a configurable feedback route for suggestions, error reports, feature requests, case studies, implementation examples, testimonials and general comments. It appears only when an approved external form URL is configured.

## Visibility recommendation

Use an institution-specific, feature-flagged workflow for the first pilot. The route is controlled by `NEXT_PUBLIC_ENABLE_SLIDES_PILOT=true` and is off by default. This avoids confusing external users and keeps the public tool institution-neutral.

A feature flag is not access control. If the pilot must be genuinely restricted, host the enabled build behind institutional authentication or an access-controlled intranet. Do not rely on an unlisted URL or a client-side password.

## Testing completed

- TypeScript compilation passed.
- Source linting passed.
- The public static build completed with the slide pilot disabled.
- A realistic fictional Level 5 applied microeconomics case generated both outputs.
- AI JSON import filled the pilot fields and exposed the missing-information review field.
- The PowerPoint archive passed structural package validation with three slides and no findings.
- The generated deck matched the supplied template’s exact slide dimensions (`11520488 × 6480175` EMU) and passed layout geometry, bullet and heading-fit checks.
- Every slide was rendered and visually reviewed. The companion DOCX archive was checked for package integrity.
- The empty-form path continues to block download until required module facts and sourced learning outcomes are supplied.
- The production build was rebuilt with the pilot flag off. Nothing was pushed or deployed.

## Outstanding risks

1. **Academic accuracy remains a human responsibility.** The prompt reduces hallucination risk but cannot prove that uploaded sources are current or approved.
2. **Learning-outcome fidelity needs pilot review.** Plain-English paraphrasing can unintentionally broaden or narrow an outcome. Module leaders must compare every paraphrase with the approved wording.
3. **Dense content can still reduce slide readability.** The generator limits visible items and shrinks text when needed, but unusually long entries require editing.
4. **Static GitHub Pages cannot provide private analytics or a private feedback database.** The reporting API and owner dashboard require a separately deployed authenticated backend and privacy approval.
5. **The feedback form is external.** The approved Microsoft Form is connected at `https://forms.cloud.microsoft/e/2CbzbswhcQ`; its access settings, privacy notice, retention and response permissions must be managed in Microsoft Forms.
6. **Testimonials need separate consent.** General feedback consent should not automatically authorise identifiable quotations in publications, promotion cases or public materials.
7. **Compatibility beyond tested rendering remains to be confirmed.** The sample opened and rendered through LibreOffice and passed package checks. A short pilot should also open it in the School’s supported PowerPoint desktop version and test an upload to KEATS.

## Recommended feedback form design

Use an institution-approved form rather than storing submissions in the static site. Keep identity optional. Suggested sections:

- purpose and privacy notice;
- feedback type: suggestion, feature request, issue, case study, implementation example, testimonial or other;
- role, institution, faculty or department, all optional unless needed for analysis;
- what the user created and how it was used;
- what saved time or improved student-facing clarity;
- what was difficult or inaccurate;
- suggested change;
- optional follow-up contact details, stored separately from anonymous responses where possible;
- separate unchecked consent boxes for internal improvement, anonymised research or evaluation, and attributable quotation.

Do not ask users to upload student work, assessment content or module documentation to the feedback form.

## Recommendations before release

1. Run a small internal pilot across at least one examination-heavy, one mixed-assessment and one coursework-only module.
2. Ask pilot users to compare the generated slide text against current approved module documents and record every correction.
3. Test both outputs in Microsoft PowerPoint, Word and KEATS with accessibility checks, including reading order and meaningful alternative text.
4. Obtain the relevant privacy and IT approval before enabling analytics or collecting feedback.
5. Review the connected Microsoft Form and confirm retention, access, quotation consent and deletion arrangements.
6. Review pilot evidence before deciding whether to expose the workflow more widely.

## Release status

Local implementation and validation are complete. The pilot remains disabled in the public build. No Git commit, GitHub push or deployment has been performed for these changes.
