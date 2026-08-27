'use client';

import { useEffect, useMemo, useState } from 'react';
import { aiPrompt, examplesFor, sampleAiResponse } from './examples';
import { createToolkitDocument, triggerDownload } from './docx-generator';
import { createSpoEmail } from './spo-email';
import { DocumentBrand, DocumentStage, HandoverItem, ToolkitData, WorkflowMode, emptyData, formatLabels, initialHandover, profileLabels } from './types';

const STORAGE_KEY = 'assessment-feedback-toolkit-draft-v2';
function savedDraft() {
  if (typeof window === 'undefined') return null;
  try { const saved = window.localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as { data?:Partial<ToolkitData>; brand?:DocumentBrand; handover?:HandoverItem[] } : null; } catch { return null; }
}
type FieldSpec = { name: keyof ToolkitData; label: string; help?: string; required?: boolean; rows?: number };
const commonFields: FieldSpec[] = [
  { name: 'moduleCode', label: 'Module code', required: true }, { name: 'moduleTitle', label: 'Module title', required: true },
  { name: 'level', label: 'Level or stage' }, { name: 'moduleLeader', label: 'Module leader', required: true },
  { name: 'academicYear', label: 'Academic year' }, { name: 'teachingPeriod', label: 'Teaching period' },
  { name: 'faculty', label: 'Faculty (optional)', help: 'Used for the document. It is transmitted only if you separately opt in to usage reporting.' },
  { name: 'department', label: 'Department (optional)', help: 'Used for the document. It is transmitted only if you separately opt in to usage reporting.' },
];
const beforeFields: FieldSpec[] = [
  { name: 'assessmentStructure', label: 'Assessment structure and weighting', required: true, rows: 3 },
  { name: 'assessmentPurpose', label: 'Why is this assessment format appropriate?', required: true, rows: 5 },
  { name: 'assessmentRequirements', label: 'Requirements, conditions and permitted resources', required: true, rows: 4 },
  { name: 'expectations', label: 'What should students demonstrate?', required: true, rows: 5 },
  { name: 'criteria', label: 'How will the criteria be applied?', required: true, rows: 5 },
  { name: 'preparation', label: 'How should students prepare?', required: true, rows: 5 },
  { name: 'workedExamples', label: 'Worked examples or practice opportunities', rows: 4 },
  { name: 'commonPitfalls', label: 'Common pitfalls and how to avoid them', rows: 4 },
  { name: 'feedbackAvailable', label: 'What feedback will students receive?', required: true, rows: 4 },
  { name: 'usingFeedback', label: 'How should students use the feedback?', required: true, rows: 4 },
  { name: 'supportRoutes', label: 'Support, Q&A or debrief routes', rows: 3 },
  { name: 'keatsLocation', label: 'Where students can find the materials', rows: 2 },
];
const afterFields: FieldSpec[] = [
  { name: 'cohortContext', label: 'Assessment and cohort context', required: true, rows: 4 },
  { name: 'evaluatedLearning', label: 'What was the assessment designed to evaluate?', required: true, rows: 5 },
  { name: 'performancePatterns', label: 'Overall performance patterns (optional)', help: 'Use aggregate, checked information only. Leave blank rather than estimating figures.', rows: 4 },
  { name: 'cohortStrengths', label: 'What did the cohort generally do well?', required: true, rows: 5 },
  { name: 'improvementAreas', label: 'Common areas for improvement', required: true, rows: 5 },
  { name: 'criteriaApplication', label: 'How were the marking criteria applied?', required: true, rows: 5 },
  { name: 'improvedApproaches', label: 'Illustrative improved approaches or reasoning', required: true, help: 'Use staff-created or carefully anonymised material; do not reproduce identifiable student work.', rows: 5 },
  { name: 'futureUse', label: 'How should students use this feedback in future?', required: true, rows: 5 },
  { name: 'debriefSupport', label: 'Further support, resources or debrief arrangements', rows: 4 },
  { name: 'keatsLocation', label: 'Where students can find feedback and materials', rows: 2 },
];

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return <button type="button" className="copy-button" onClick={copy} aria-live="polite">{copied ? 'Copied' : label}</button>;
}

function Field({ spec, value, onChange, examples, showError = false }: { spec: FieldSpec; value: string; onChange: (value: string) => void; examples?: string[]; showError?: boolean }) {
  const id = `field-${spec.name}`; const errorId = `${id}-error`; const invalid = Boolean(showError && spec.required && !value.trim());
  return <div className={`field ${spec.rows ? 'field-wide' : ''}`}>
    <label htmlFor={id}>{spec.label}{spec.required && <span className="required"> (required)</span>}</label>
    {spec.rows ? <textarea id={id} value={value} rows={spec.rows} onChange={(e) => onChange(e.target.value)} aria-describedby={`${spec.help ? `${id}-help ` : ''}${invalid ? errorId : ''}`.trim() || undefined} />
      : <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={`${spec.help ? `${id}-help ` : ''}${invalid ? errorId : ''}`.trim() || undefined} />}
    {spec.help && <p className="field-help" id={`${id}-help`}>{spec.help}</p>}
    {invalid && <p className="field-error" id={errorId}>Complete this field before downloading.</p>}
    {examples?.length ? <details className="examples"><summary>Show examples</summary><p className="example-note">Editable suggestions—not mandatory policy wording. Check and adapt them for your module.</p>{examples.map((example, index) => <div className="example-card" key={index}><p>{example}</p><div><CopyButton text={example} /><button type="button" className="use-button" onClick={() => onChange(value.trim() ? `${value.trim()}\n\n${example}` : example)}>Use in field</button></div></div>)}</details> : null}
  </div>;
}

function parseAi(raw: string): Partial<ToolkitData> {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No valid JSON object was found. Copy the complete ChatGPT response and try again.');
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  const allowed = new Set(Object.keys(emptyData)); const result: Partial<ToolkitData> = {};
  for (const [key, value] of Object.entries(parsed)) if (allowed.has(key) && typeof value === 'string') (result as Record<string, string>)[key] = value;
  return result;
}

export default function Home() {
  const [stage, setStage] = useState<DocumentStage | ''>(''); const [workflow, setWorkflow] = useState<WorkflowMode | ''>('');
  const [brand, setBrand] = useState<DocumentBrand>(() => savedDraft()?.brand || 'generic'); const [data, setData] = useState<ToolkitData>(() => ({ ...emptyData, ...(savedDraft()?.data || {}) }));
  const [aiResult, setAiResult] = useState(''); const [status, setStatus] = useState(''); const [showReview, setShowReview] = useState(false);
  const [handover, setHandover] = useState<HandoverItem[]>(() => savedDraft()?.handover || initialHandover); const [spoEmail, setSpoEmail] = useState(''); const [ccEmail, setCcEmail] = useState('');
  const [consent, setConsent] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const examples = useMemo(() => stage ? examplesFor(stage, data.assessmentFormat) : {}, [stage, data.assessmentFormat]);
  const aiSample = useMemo(() => stage ? sampleAiResponse(stage) : '', [stage]);
  const fields = stage === 'before' ? beforeFields : afterFields;
  const requiredSpecs: FieldSpec[] = [...commonFields, ...fields, { name:'assessmentProfile', label:'Broad assessment profile', required:true }, { name:'assessmentFormat', label:'Main assessment format', required:true }];
  const missing = requiredSpecs.filter(f => f.required && !String(data[f.name] || '').trim());

  useEffect(() => { const timer = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, brand, handover })), 250); return () => clearTimeout(timer); }, [data, brand, handover]);
  function update(name: keyof ToolkitData, value: string) { setData(current => ({ ...current, [name]: value })); setStatus(''); }
  function chooseStage(next: DocumentStage) { setStage(next); setWorkflow(''); setShowReview(false); setStatus(''); window.setTimeout(() => document.getElementById('route-heading')?.focus(), 20); }
  function importAi() { try { const values = parseAi(aiResult); setData(current => ({ ...current, ...values })); setStatus(`Draft imported. ${Object.values(values).filter(Boolean).length} fields were filled; review every field and complete any gaps.`); } catch (error) { setStatus(error instanceof Error ? error.message : 'The response could not be imported.'); } }
  async function download() {
    setShowReview(true); if (missing.length || !confirmed) { setStatus(missing.length ? `Complete ${missing.length} required field${missing.length === 1 ? '' : 's'} before downloading.` : 'Confirm the final review statement before downloading.'); document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' }); return; }
    setStatus('Creating your editable Word document…');
    try {
      const logo = brand === 'kcl' ? await fetch('/kcl-logo.png').then(r => { if (!r.ok) throw new Error('The KCL logo could not be loaded.'); return r.arrayBuffer(); }) : undefined;
      const result = await createToolkitDocument(data, stage as DocumentStage, brand, logo); triggerDownload(result.blob, result.filename);
      setStatus(`Downloaded ${result.filename}. Nothing has been published automatically.`);
      if (consent) fetch('/api/usage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ consent:true, faculty: data.faculty.trim(), department: data.department.trim(), stage, workflow, assessmentProfile: data.assessmentProfile, assessmentFormat: data.assessmentFormat, academicPeriod: data.academicYear }) }).catch(() => undefined);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'The document could not be created.'); }
  }
  function updateHandover(id: string, key: 'status' | 'url', value: string) { setHandover(items => items.map(item => item.id === id ? { ...item, [key]: value } : item) as HandoverItem[]); }
  function openEmail() {
    if (!spoEmail.trim()) { setStatus('Enter the SPO email address first.'); return; }
    const missingEmailDetails = [
      !data.moduleCode.trim() && 'module code',
      !data.moduleTitle.trim() && 'module title',
      !data.moduleLeader.trim() && 'module leader',
    ].filter(Boolean);
    if (missingEmailDetails.length) {
      setStatus(`Add the ${missingEmailDetails.join(', ')} before preparing the SPO email.`);
      document.getElementById('field-moduleCode')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.location.href = createSpoEmail(data, handover, spoEmail, ccEmail).href;
  }

  return <main data-toolkit-version="2026.08.27.1">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="topbar"><div className="brand-mark" aria-hidden="true">A</div><div><p className="brand-line">Assessment and Feedback Toolkit</p><p className="brand-subline">Editable starting points for university educators</p></div><a href="#about" className="top-link">About & privacy</a></header>
    <div id="main-content">
      <section className="hero"><div><p className="kicker">Before and after assessment</p><h1>Make assessment clearer and feedback more useful</h1><p className="lede">Create an editable guide before assessment or cohort-level general feedback after assessment. Start with copyable examples, use your own ChatGPT account, or complete a structured form manually.</p><div className="hero-points"><span>Fully editable Word output</span><span>Nothing published automatically</span><span>Your academic judgement remains central</span></div></div><aside className="time-card" aria-label="Indicative completion times"><strong>Designed to save time</strong><p>AI-assisted guide: about 5–10 minutes</p><p>Manual guide: about 10–20 minutes</p><p>General feedback: about 10–15 minutes once themes are ready</p><small>Pilot estimates only; actual time will vary.</small></aside></section>
      <section className="intro-card"><p><strong>Examples are available throughout.</strong> Open “Show examples” beneath a prompt, copy a suggestion, and adapt it instead of starting from a blank page.</p><div className="details-grid"><details><summary>Why this is useful</summary><p>Help students understand why they are assessed, what good performance looks like, how to prepare, what feedback means and how to improve.</p></details><details><summary>What remains under your control</summary><p>Every document is editable. Nothing is sent to students or KEATS automatically. The module leader owns, checks and approves the final content.</p></details><details><summary>How is my information used?</summary><p>Manual form entries stay in this browser. In the AI route, material is shared directly with your own ChatGPT account—not with this site. Optional usage reporting sends only the clearly listed aggregate fields after a successful download.</p></details><details id="about"><summary>About this resource</summary><p>Created by Dr Canh Thien Dang, with development assistance from ChatGPT by OpenAI. Initially designed to support colleagues at King’s College London; colleagues at other universities may use and adapt it, subject to local policies.</p></details></div></section>

      <section className="chooser" aria-labelledby="stage-heading"><p className="section-label">1 · Choose the moment</p><h2 id="stage-heading">What would you like to create?</h2><div className="stage-grid"><button type="button" className={stage === 'before' ? 'stage-card selected' : 'stage-card'} onClick={() => chooseStage('before')}><span>Before the assessment</span><strong>Assessment and Feedback Guide</strong><p>Clarify purpose, expectations, criteria, preparation, requirements and feedback routes.</p></button><button type="button" className={stage === 'after' ? 'stage-card selected' : 'stage-card'} onClick={() => chooseStage('after')}><span>After the assessment</span><strong>General Feedback for KEATS</strong><p>Explain cohort strengths, improvements, criteria and practical next steps without identifiable student information.</p></button></div></section>

      {stage && <section className="tool-card" aria-labelledby="route-heading"><p className="section-label">2 · Choose how to start</p><h2 id="route-heading" tabIndex={-1}>Use ChatGPT or complete it manually</h2><div className="route-grid"><button type="button" className={workflow === 'ai' ? 'route-card selected' : 'route-card'} onClick={() => setWorkflow('ai')}><strong>ChatGPT-assisted</strong><p>Copy a careful extraction prompt, work in your own ChatGPT account, then paste the structured draft back here.</p><small>Free ChatGPT accounts can use the prompt; availability of file upload features may vary.</small></button><button type="button" className={workflow === 'manual' ? 'route-card selected' : 'route-card'} onClick={() => setWorkflow('manual')}><strong>Manual</strong><p>Complete a concise structured template with expandable, copyable examples.</p><small>Your entries remain in this browser unless you opt in to a limited usage event.</small></button></div>
      {workflow && <>
        <div className="safety-banner"><strong>Keep student information out.</strong> Do not enter or upload names, IDs, individual scripts, raw marks, named comments or identifiable student work. For general feedback, use anonymised aggregate themes only.</div>
        {workflow === 'ai' && <section className="ai-panel"><h3>Prepare a first draft in your own ChatGPT</h3><ol><li>Gather the approved, current sources you may use: syllabus or module outline, course aims and learning outcomes, assessment brief, marking guide or marking scheme, and marking rubric or criteria. For post-assessment feedback, also prepare checked, anonymised aggregate cohort themes.</li><li>Copy the prompt below.</li><li>Open ChatGPT, upload or paste the approved sources, and add the prompt. Do not upload personal student information, identifiable work or material that is not authorised for this purpose.</li><li>Paste ChatGPT’s JSON response below, import it, and review the completed fields.</li></ol><div className="prompt-box"><pre tabIndex={0} aria-label="Scrollable ChatGPT prompt">{aiPrompt(stage, data.assessmentFormat)}</pre><CopyButton text={aiPrompt(stage, data.assessmentFormat)} label="Copy AI prompt" /></div><a className="external-link" href="https://chatgpt.com/" target="_blank" rel="noreferrer">Open ChatGPT in a new tab</a><label className="field field-wide" htmlFor="ai-result"><span>Paste the JSON response</span><textarea id="ai-result" rows={8} value={aiResult} onChange={e => setAiResult(e.target.value)} aria-describedby="ai-result-help" /></label><p className="field-help import-help" id="ai-result-help">Select “Import the draft” and the fields below will be filled automatically. Review, correct and edit every field before downloading the final Word document.</p><details className="ai-example"><summary>Try a fictional {stage === 'before' ? 'pre-assessment guide' : 'post-assessment feedback'} example</summary><p>This example contains no real module or student information. Use it to test the import, then replace every fictional detail before creating a document for students.</p><div className="sample-json"><pre tabIndex={0} aria-label={`Fictional ${stage === 'before' ? 'pre-assessment' : 'post-assessment'} JSON example`}>{aiSample}</pre><div><CopyButton text={aiSample} label="Copy example JSON" /><button type="button" className="use-button" onClick={() => setAiResult(aiSample)}>Use example in box</button></div>{aiResult === aiSample && <p className="sample-status" role="status">Example added. Select “Import the draft” to fill the fields below automatically.</p>}</div></details><button type="button" className="secondary-button" onClick={importAi}>Import the draft</button></section>}
        <section className="form-section"><p className="section-label">3 · Module and assessment</p><h2>Check the basic details</h2><div className="form-grid">{commonFields.map(spec => <Field key={spec.name} spec={spec} value={String(data[spec.name] || '')} onChange={value => update(spec.name, value)} showError={showReview} />)}<div className="field"><label htmlFor="field-assessmentProfile">Broad assessment profile <span className="required">(required)</span></label><select id="field-assessmentProfile" value={data.assessmentProfile} onChange={e => update('assessmentProfile', e.target.value)} aria-describedby={showReview && !data.assessmentProfile ? 'assessment-profile-error' : undefined}><option value="">Select one</option>{Object.entries(profileLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>{showReview && !data.assessmentProfile && <p className="field-error" id="assessment-profile-error">Select the examination-heavy, mixed-assessment or coursework-only profile.</p>}</div><div className="field"><label htmlFor="field-assessmentFormat">Main assessment format <span className="required">(required)</span></label><select id="field-assessmentFormat" value={data.assessmentFormat} onChange={e => update('assessmentFormat', e.target.value)} aria-describedby={showReview && !data.assessmentFormat ? 'assessment-format-error' : undefined}><option value="">Select one</option>{Object.entries(formatLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>{showReview && !data.assessmentFormat && <p className="field-error" id="assessment-format-error">Select the closest format; you can describe combinations in the document.</p>}</div></div></section>
        <section className="form-section"><p className="section-label">4 · Student-facing content</p><h2>{stage === 'before' ? 'Clarify expectations and preparation' : 'Make cohort feedback useful'}</h2><p className="section-intro">Examples change with your document stage and assessment format. They are editable suggestions, not institutional policy.</p><div className="form-grid">{fields.map(spec => <Field key={spec.name} spec={spec} value={String(data[spec.name] || '')} onChange={value => update(spec.name, value)} examples={examples[spec.name]} showError={showReview} />)}</div></section>
        <section className="form-section"><p className="section-label">5 · Document style</p><h2>Choose the output branding</h2><div className="brand-choice"><label><input type="radio" name="brand" checked={brand === 'generic'} onChange={() => setBrand('generic')} /> Generic, institution-neutral document</label><label><input type="radio" name="brand" checked={brand === 'kcl'} onChange={() => setBrand('kcl')} /> King’s College London document with KCL logo and red styling</label></div><p className="field-help">Select KCL only when the document is for authorised KCL use. The public website remains institution-neutral.</p></section>
        <section className="form-section" id="review"><p className="section-label">6 · Review and download</p><h2>Keep ownership of the final document</h2>{showReview && missing.length > 0 && <div className="error-summary" role="alert"><strong>{missing.length} required field{missing.length === 1 ? '' : 's'} still need attention:</strong><ul>{missing.map(field => <li key={field.name}><a href={`#field-${field.name}`}>{field.label}</a></li>)}</ul></div>}<label className="confirm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> <span>I have checked the content for accuracy, current requirements, accessibility and suitability for students. I understand that nothing is published automatically.</span></label><details className="privacy-consent"><summary>Optional: help Dr Canh Thien Dang report aggregate toolkit use</summary><p>If you opt in, one document-generation event will send: faculty, department, document type, manual/AI route, broad assessment profile, assessment format, academic period and event date. It will not send your name, email, module details, form responses, syllabus, feedback, document, ChatGPT content, student information, raw marks or a persistent user identifier.</p><label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I consent to sending those limited fields after a successful download.</label><p className="field-help">Declining does not affect the tool. Counts represent generation events, not unique colleagues. Records are retained for up to 24 months; reporting suppresses cells with fewer than five events. Collection remains subject to any required institutional privacy or IT approval.</p>{consent && <div className="consent-review"><strong>Fields to be sent</strong><p>Faculty: {data.faculty || 'Not supplied'} · Department: {data.department || 'Not supplied'} · Type: {stage === 'before' ? 'pre-assessment guide' : 'post-assessment feedback'} · Route: {workflow} · Profile: {data.assessmentProfile || 'Not selected'} · Format: {data.assessmentFormat ? formatLabels[data.assessmentFormat] : 'Not selected'} · Period: {data.academicYear || 'Not supplied'}</p></div>}</details><button type="button" className="primary-button" onClick={download}>Download editable Word document</button><p className="status" role="status" aria-live="polite">{status}</p></section>

        <section className="form-section"><p className="section-label">7 · Optional SPO handover</p><h2>Package useful revision materials</h2><p className="section-intro">The generated document can be accompanied by approved materials. This checklist does not block download and is not a universal obligation.</p><div className="handover-list">{handover.map(item => <div className="handover-item" key={item.id}><span>{item.label}</span><select aria-label={`${item.label} status`} value={item.status} onChange={e => updateHandover(item.id, 'status', e.target.value)}><option value="included">Included</option><option value="link">Link provided</option><option value="follow">To follow</option><option value="na">Not applicable</option></select>{item.status === 'link' && <input aria-label={`${item.label} link`} type="url" placeholder="https://…" value={item.url} onChange={e => updateHandover(item.id, 'url', e.target.value)} />}</div>)}</div><details className="release-safeguards"><summary>Release and anonymisation safeguards</summary><ul><li>Prefer staff-created, generic or properly redacted examples. Do not automatically share a previous student submission.</li><li>Use student work only when policy permits, any required permission is in place and anonymisation goes beyond removing a name.</li><li>Remove metadata, tracked changes, comments, filenames and contextual details that could reveal identity.</li><li>Check past materials for protected questions or topics that may be reused; generalise content while preserving lessons about reasoning and method.</li><li>Use the current approved rubric, label materials as mock, past, illustrative or generic, and confirm accessibility and authorisation before release.</li></ul></details><div className="email-grid"><label className="field"><span>SPO email address</span><input type="email" value={spoEmail} onChange={e => setSpoEmail(e.target.value)} /></label><label className="field"><span>Optional CC</span><input type="email" value={ccEmail} onChange={e => setCcEmail(e.target.value)} /></label></div><button type="button" className="secondary-button" onClick={openEmail}>Prepare email to SPO</button><p className="field-help">Your email app will open with a draft. Attach the downloaded document and approved materials before sending.</p></section>
      </>}</section>}
    </div>
    <footer><p>Created by Dr Canh Thien Dang, with development assistance from ChatGPT by OpenAI.</p><p>The toolkit provides editable starting points and examples. It is not institutional policy, legal advice or automatic approval. Users remain responsible for local requirements and final documents.</p><a href="/admin">Owner reporting</a></footer>
  </main>;
}
