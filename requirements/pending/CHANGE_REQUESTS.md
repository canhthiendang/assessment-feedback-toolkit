# Change specification — implemented after “execute” on 26 August 2026

## Generated Word document branding

- Use the supplied King’s College London logo in generated Word documents.
- Source asset: `KCL_logo_supplied.png` (398 × 306 px, RGBA PNG).
- Revise the Word document colour palette to reflect the supplied logo, with KCL red as the principal accent colour.
- Retain appropriate contrast, readability and document accessibility when applying the red palette.

## Execution gate

The user explicitly said “execute”; this gate has been satisfied and the requirements below have been implemented and verified.

## One-stop assessment and feedback site

Reframe the site around two connected stages:

1. **Before assessment — Assessment and Feedback Guide**
   - Retain the existing generator for expectations, criteria, preparation, requirements, worked examples, common pitfalls, and assessment readiness.
2. **After assessment — General Feedback document for KEATS**
   - Add a second generator for a concise cohort-level feedback document.
   - Cover what feedback is available, how students should interpret it, common strengths, common areas for improvement, how the marking criteria were applied, and practical next steps for future performance.
   - Include a cohort-level debrief section where useful.
   - Produce an editable Word document suitable for posting on KEATS.

The landing experience should make the timing and purpose explicit: “Before the assessment” and “After the assessment”. Both generators should support the manual and ChatGPT-assisted routes.

## Time-saving examples under prompts

- Add a short early message explaining that examples are available throughout and can be copied and adapted.
- Under relevant prompts in both the manual and AI-assisted workflows, provide collapsed “Show examples” controls.
- When expanded, examples should be easy to copy individually.
- Examples are editable suggestions, not mandatory School policy wording; module leaders remain responsible for accuracy and alignment.
- Tailor examples to undergraduate economics and management modules in a leading UK business school.

Examples should cover relevant assessment formats, including:

- closed-book or in-person examinations;
- open-book or time-limited examinations;
- coursework essays and reports;
- quantitative problem sets;
- economics, statistics, or econometrics data projects;
- case analyses;
- individual and group presentations;
- group projects; and
- take-home assessments where used.

## Themes the examples must address

- Why a particular assessment format is educationally appropriate for the module.
- What knowledge, analytical reasoning, quantitative fluency, judgement, communication, or application the task assesses.
- How the assessment contributes value in an AI-enabled environment without making simplistic claims that examinations merely “prevent AI use”.
- What good performance looks like in module-specific terms.
- How students should prepare and which practice activities matter.
- Common pitfalls and how to avoid them.
- How students should interpret cohort and individual feedback.
- How students can transfer feedback into later modules, assessments, dissertations, or professional work.

For an in-person examination, suitable rationale examples may refer to independently applying core concepts under time constraints, demonstrating fluency in economic or quantitative reasoning, selecting and justifying an appropriate method without real-time external assistance, and providing comparable conditions across the cohort. Avoid implying that examinations are inherently superior or valuable only because they restrict generative AI.

## General Feedback document — proposed content structure

1. Assessment and cohort context.
2. What the assessment was designed to evaluate.
3. Overall performance patterns, using aggregated and non-identifiable information.
4. What the cohort generally did well.
5. Common areas for improvement.
6. How the marking criteria were applied.
7. Illustrative improved approaches or reasoning, without reproducing identifiable student work.
8. How to use this feedback in future assessment and learning.
9. Further support, resources, office hours, or debrief arrangements.

## AI-assisted post-assessment route

- Permit colleagues to use their own ChatGPT account with a tailored prompt.
- Suggested inputs: assessment brief, marking criteria or rubric, module learning outcomes, and anonymised/aggregated feedback themes supplied by the module team.
- ChatGPT should draft structured cohort-level feedback, clearly separate supported information from missing information, and never invent performance statistics.
- The site should import the structured result and ask only for missing essential information.
- Do not request or process identifiable student information, individual scripts, named comments, student numbers, or raw grade records.

## Design assumptions to retain unless changed before execution

- Examples vary dynamically by document stage and assessment format rather than presenting one generic example bank.
- The General Feedback document is cohort-level and complementary to individual feedback; it is not a replacement for individual marking comments.
- Numeric performance summaries are optional and may be included only when entered explicitly by the module team.
- All generated content remains editable and must be reviewed by the module leader before publication.

## Front-page adoption, reassurance, and transparency

The first page should give colleagues a concise reason to use the tool before asking them to choose a route. It should make the following clear:

- **Purpose:** help students understand why they are being assessed, what good performance looks like, how to prepare, what feedback means, and how to improve.
- **Two moments:** create an Assessment and Feedback Guide before assessment, or a General Feedback document after assessment.
- **Time saving:** colleagues start from examples, a syllabus-assisted ChatGPT draft, or a structured manual template rather than a blank page.
- **Time estimates:** give short indicative completion times for each route, clearly labelled as estimates to be reviewed during the pilot rather than guaranteed times.
- **Editability and ownership:** every generated document is fully editable; nothing is published automatically; the module leader retains academic ownership, judgement, and responsibility for the final wording.
- **Safety:** do not upload identifiable student data or student work; explain separately what happens in the manual and ChatGPT-assisted routes.
- **Examples:** tell colleagues early that expandable, copyable examples are provided throughout.

Use a short visible summary plus optional expandable sections such as:

- “Why this is useful”
- “How long will it take?”
- “What remains under your control?”
- “How is my information used?”

Avoid presenting the tool as a compliance exercise or implying that it replaces module-leader judgement.

## Optional, consent-based usage reporting

Add a genuinely optional analytics choice so Dr Canh Thien Dang can report aggregated adoption to departments and Faculty.

Recommended event to record only after explicit consent and successful document generation:

- faculty;
- department;
- document stage/type: pre-assessment guide or post-assessment general feedback;
- completion route: manual or ChatGPT-assisted;
- broad assessment profile or format where useful;
- event date or academic period; and
- a non-identifying event identifier solely for record integrity, if technically required.

Do **not** intentionally collect or store:

- colleague name or email;
- module leader identity;
- syllabus or uploaded file;
- module code or title;
- form responses;
- feedback content;
- generated Word document;
- ChatGPT prompt, response, conversation, or credentials;
- individual student data, scripts, comments, marks, or grade records; or
- a persistent identifier intended to track a colleague across visits.

Consent design requirements:

- no pre-selected checkbox;
- declining must not restrict either generator or any download;
- explain exactly which fields will be sent and why;
- record only when a document is generated, not merely when the page is visited;
- allow colleagues to review the selected department/faculty before submitting;
- distinguish a count of document-generation events from a count of unique colleagues;
- do not claim that usage counts represent unique users unless a separate, privacy-reviewed method is approved;
- provide a short privacy notice and contact/owner identification;
- define and disclose a retention period before launch; and
- obtain any necessary King’s privacy, information-governance, or IT approval before collecting live analytics.

Because department/faculty plus a timestamp can become identifying in small units, the reporting view should favour monthly or term-level aggregates and suppress or combine very small cells where appropriate.

## Private reporting record

- Create a separate owner-only reporting view for Dr Canh Thien Dang.
- Show aggregated counts by academic period, faculty, department, document type, completion route, and assessment profile/format.
- Do not expose raw form content or personal identifiers.
- Provide a simple downloadable aggregate record if needed for School or Faculty reporting.
- Protect the reporting view with authenticated owner access; a hidden URL alone is not sufficient security.

## Completion and SPO handover — revision-materials package

At the final download/email stage, ask colleagues to provide the SPO with the generated document and, where appropriate and approved for release, a small set of supporting revision materials for publication on the relevant KEATS or programme pages.

The completion screen should include a checklist such as:

- generated Assessment and Feedback Guide or General Feedback document;
- mock paper or an approved past paper;
- solution, model answer, or model approach;
- current marking rubric or assessment criteria;
- an annotated worked example showing what was done well and what could be improved; and/or
- generic cohort feedback from a previous year.

For each item, allow a status such as “included”, “link provided”, “not applicable”, or “to follow”. Do not prevent document generation when supporting materials are unavailable.

The prepared SPO email should:

- ask the SPO to upload or link the approved materials on the relevant KEATS/programme pages;
- list the materials the colleague says are included or linked;
- remind the sender to attach the downloaded files before sending; and
- request confirmation or follow-up where a page location is unclear.

## Release safeguards for supporting materials

- Default to staff-created generic or redacted examples where these can meet the educational purpose.
- Do not share a previous student submission automatically.
- Previous student work may be used only when institutional policy permits, any necessary permission has been obtained, and anonymisation has been checked carefully; removal of a name alone may be insufficient.
- Do not include identifiable student information, feedback addressed to a named student, embedded document metadata, tracked changes, comments, filenames, or contextual details that could reveal identity.
- Check past papers, solutions, and examples for questions or topics that may be reused in future assessments.
- Permit colleagues to remove or generalise content that would reveal protected future assessment topics while preserving useful lessons about reasoning, method, structure, or common errors.
- Ensure the rubric or criteria are current and approved for the relevant assessment.
- Label materials clearly as mock, past, illustrative, or generic so students do not mistake them for the specification of a future assessment.
- Require module-leader confirmation that every item is authorised, accessible, suitable for students, and safe to publish.
- Do not represent the checklist as a universal obligation where discipline, assessment-security, copyright, consent, or accessibility considerations make a particular item inappropriate.

## Intended student benefit

Supporting materials should help students understand how assessment expectations have been applied in practice, distinguish stronger from weaker approaches, learn from previous cohort patterns, and revise using concrete examples rather than guessing what markers expect.

## Institution-neutral public site and KCL-specific document branding

- Remove King’s Business School branding, marks, and any presentation that makes the public website appear School-owned.
- Use a neutral public identity such as “Assessment and Feedback Toolkit” or “Assessment and Feedback Document Generator”.
- Explain that the resource was initially created to support colleagues at King’s College London but is available for colleagues at other universities to use and adapt.
- Do not imply that the website or its guidance is official policy of King’s College London, King’s Business School, another university, or OpenAI.
- Keep KCL logo and red branding for a Word document only when the user has selected a KCL output or otherwise explicitly confirmed KCL affiliation.
- Provide a generic, institution-neutral Word output for users from other universities. Do not place the KCL logo on an external colleague’s document by default.
- A later optional enhancement may allow external users to upload or insert their own institutional logo locally, subject to safe file handling and document accessibility.

## Credits and reuse statement

Give authorship and AI-assistance credits clearly but unobtrusively on the front page and in an expandable “About this resource” section.

Recommended durable wording:

> Created by Dr Canh Thien Dang, with development assistance from ChatGPT by OpenAI. This resource was initially designed to support clearer assessment expectations, preparation, and feedback use among colleagues at King’s College London. Colleagues at other universities are welcome to use and adapt the toolkit for educational purposes, subject to their own institutional policies.

Prefer “ChatGPT by OpenAI” over a model-specific “ChatGPT 5.6” credit in the permanent front-page wording because model names change and may make the credit quickly inaccurate. If model provenance is desired, place the model/version and build date in the expandable About section rather than the main identity.

Add a disclaimer such as:

> The toolkit provides editable starting points and examples. It does not constitute institutional policy, legal advice, or automatic approval of assessment materials. Users remain responsible for checking local requirements and approving the final documents.

If a formal open licence is desired, confirm authority and institutional IP requirements before applying one. Do not imply that the KCL logo or other institutional marks are licensed for reuse.

## Accessibility requirements

Make the site and generated documents as accessible as reasonably possible, targeting WCAG 2.2 AA for the website and accessible Word-document practices.

At minimum:

- full keyboard operation and clearly visible focus states;
- correct heading hierarchy and semantic landmarks;
- explicit labels and instructions for every field;
- error messages linked to the relevant fields and announced to assistive technology;
- no information conveyed by colour alone;
- sufficient text and control contrast, including the KCL red palette;
- touch targets and layouts usable on mobile and at browser zoom;
- reduced-motion support;
- expandable examples implemented with accessible controls and state announcements;
- copy actions that provide visible and screen-reader confirmation;
- plain-language privacy and consent explanations;
- no forced time limit or loss of draft when navigating;
- accessible tables, meaningful document structure, page numbering, and image alternative text in generated Word files; and
- a final accessibility audit of both manual and ChatGPT-assisted journeys and representative KCL and generic Word outputs before publication.

## Updated execution gate

The user withdrew the previous execute instruction by saying “hold on”. Continue recording requirements only. Do not implement or republish until the user gives a new, explicit execute instruction after this update.
