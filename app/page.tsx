'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  assessmentLabels,
  AssessmentType,
  createGuideDocument,
  GuideData,
  triggerDownload,
} from './docx-generator';

const STORAGE_KEY = 'kbs-module-guide-draft-v1';
const WORKFLOW_KEY = 'kbs-module-guide-workflow-v1';
const DEFAULT_SPO_EMAIL = '';
const DEFAULT_PD_CC = '';

type WorkflowMode = '' | 'manual' | 'ai';

const aiExtractionPrompt = `You are helping a university module leader prepare a concise Module Assessment and Feedback Guide.

Read the syllabus or module outline I attach, together with any additional information I provide. Extract only information supported by those sources. Do not invent missing facts. Write concise, student-facing wording. Return ONLY one valid JSON object, with no markdown fences or commentary.

Use exactly these keys and string values:
{
  "assessmentType": "exam | mixed | coursework | ",
  "moduleCode": "",
  "moduleTitle": "",
  "level": "",
  "department": "",
  "moduleLeader": "",
  "academicYear": "",
  "teachingPeriod": "",
  "syllabusName": "",
  "sourceNotes": "",
  "assessmentStructure": "",
  "assessmentPurpose": "",
  "expectations": "",
  "criteria": "",
  "preparation": "",
  "workedExamples": "",
  "commonPitfalls": "",
  "feedbackAvailable": "",
  "usingFeedback": "",
  "supportRoutes": "",
  "keatsLink": "",
  "examFormat": "",
  "examCoverage": "",
  "examConditions": "",
  "mixedRelationship": "",
  "mixedSequence": "",
  "courseworkMilestones": "",
  "courseworkSubmission": ""
}

Assessment type rules: use "exam" for 80–100% examination, "mixed" for 1–79% examination, and "coursework" for 0% examination. Leave any unsupported value as an empty string. Do not include student names, student work or identifiable student information.`;

const essentialFields: Array<{ name: keyof GuideData; label: string; step: number }> = [
  { name: 'assessmentType', label: 'Assessment profile', step: 1 },
  { name: 'moduleCode', label: 'Module code', step: 2 },
  { name: 'moduleTitle', label: 'Module title', step: 2 },
  { name: 'moduleLeader', label: 'Module leader', step: 2 },
  { name: 'assessmentStructure', label: 'Assessment structure and weighting', step: 3 },
  { name: 'assessmentPurpose', label: 'Purpose of the assessment', step: 3 },
  { name: 'expectations', label: 'What students are expected to demonstrate', step: 3 },
  { name: 'criteria', label: 'How the marking criteria will be applied', step: 3 },
  { name: 'preparation', label: 'How students should prepare', step: 3 },
  { name: 'feedbackAvailable', label: 'Feedback students will receive', step: 3 },
  { name: 'usingFeedback', label: 'How students should use feedback', step: 3 },
];

const recommendedFields: Array<{ name: keyof GuideData; label: string; step: number }> = [
  { name: 'workedExamples', label: 'Worked examples or practice opportunities', step: 3 },
  { name: 'commonPitfalls', label: 'Common pitfalls', step: 3 },
  { name: 'supportRoutes', label: 'Support and contact routes', step: 3 },
];

const assessmentTypes: Array<{
  id: AssessmentType;
  eyebrow: string;
  title: string;
  description: string;
  marker: string;
}> = [
  {
    id: 'exam',
    eyebrow: 'Examination-heavy',
    title: 'Mostly examinations',
    description: 'For modules where examinations account for most of the final mark.',
    marker: '80–100% exam',
  },
  {
    id: 'mixed',
    eyebrow: 'Mixed assessment',
    title: 'Exams and coursework',
    description: 'For modules combining examinations with coursework or other assessed activity.',
    marker: '1–79% exam',
  },
  {
    id: 'coursework',
    eyebrow: 'Coursework-only',
    title: 'No examination',
    description: 'For modules assessed through coursework, projects, presentations or similar work.',
    marker: '0% exam',
  },
];

const emptyGuide: GuideData = {
  assessmentType: '',
  moduleCode: '',
  moduleTitle: '',
  level: '',
  department: '',
  moduleLeader: '',
  academicYear: '2026/27',
  teachingPeriod: '',
  syllabusName: '',
  sourceNotes: '',
  assessmentStructure: '',
  assessmentPurpose: '',
  expectations: '',
  criteria: '',
  preparation: '',
  workedExamples: '',
  commonPitfalls: '',
  feedbackAvailable: '',
  usingFeedback: '',
  supportRoutes: '',
  keatsLink: '',
  examFormat: '',
  examCoverage: '',
  examConditions: '',
  mixedRelationship: '',
  mixedSequence: '',
  courseworkMilestones: '',
  courseworkSubmission: '',
};

const steps = ['Assessment profile', 'Module details', 'Guidance content', 'Review and share'];

type InputProps = {
  label: string;
  name: keyof GuideData;
  value: string;
  onChange: (name: keyof GuideData, value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: string;
};

function InputField({ label, name, value, onChange, placeholder, hint, required, type = 'text' }: InputProps) {
  const id = `field-${name}`;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

type TextAreaProps = InputProps & { rows?: number };

function TextAreaField({ label, name, value, onChange, placeholder, hint, required, rows = 4 }: TextAreaProps) {
  const id = `field-${name}`;
  return (
    <label className="field field-wide" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        rows={rows}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="preview-item">
      <dt>{label}</dt>
      <dd>{value.trim() || 'Not yet supplied'}</dd>
    </div>
  );
}

function missingFrom(fields: Array<{ name: keyof GuideData; label: string; step: number }>, data: GuideData) {
  return fields.filter(({ name }) => !String(data[name] || '').trim());
}

function profileRecommendedFields(data: GuideData) {
  if (data.assessmentType === 'exam') {
    return [
      ...recommendedFields,
      { name: 'examFormat' as const, label: 'Examination format and duration', step: 3 },
      { name: 'examCoverage' as const, label: 'Examination coverage', step: 3 },
      { name: 'examConditions' as const, label: 'Examination conditions and permitted materials', step: 3 },
    ];
  }
  if (data.assessmentType === 'mixed') {
    return [
      ...recommendedFields,
      { name: 'mixedRelationship' as const, label: 'Relationship between assessment components', step: 3 },
      { name: 'mixedSequence' as const, label: 'Sequencing across assessment components', step: 3 },
    ];
  }
  if (data.assessmentType === 'coursework') {
    return [
      ...recommendedFields,
      { name: 'courseworkMilestones' as const, label: 'Coursework milestones and formative opportunities', step: 3 },
      { name: 'courseworkSubmission' as const, label: 'Coursework submission requirements', step: 3 },
    ];
  }
  return recommendedFields;
}

function parseAiGuide(raw: string): Partial<GuideData> {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object was found.');
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  const allowed = new Set(Object.keys(emptyGuide));
  const result: Partial<GuideData> = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (!allowed.has(key) || typeof value !== 'string') continue;
    if (key === 'assessmentType' && value && !['exam', 'mixed', 'coursework'].includes(value)) continue;
    (result as Record<string, string>)[key] = value.trim();
  }

  if (!Object.keys(result).length) throw new Error('The response did not contain any recognised guide fields.');
  return result;
}

export default function Home() {
  const [workflow, setWorkflow] = useState<WorkflowMode>('');
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GuideData>(emptyGuide);
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [spoEmail, setSpoEmail] = useState(DEFAULT_SPO_EMAIL);
  const [pdCc, setPdCc] = useState(DEFAULT_PD_CC);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiImported, setAiImported] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setData({ ...emptyGuide, ...JSON.parse(stored) });
      const storedWorkflow = window.localStorage.getItem(WORKFLOW_KEY);
      if (storedWorkflow === 'manual' || storedWorkflow === 'ai') setWorkflow(storedWorkflow);
    } catch {
      // A damaged local draft should never prevent the form from opening.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => {
    if (!ready || !workflow) return;
    window.localStorage.setItem(WORKFLOW_KEY, workflow);
  }, [workflow, ready]);

  const selectedProfile = useMemo(
    () => assessmentTypes.find((type) => type.id === data.assessmentType),
    [data.assessmentType],
  );

  const essentialMissing = useMemo(() => missingFrom(essentialFields, data), [data]);
  const recommendedMissing = useMemo(() => missingFrom(profileRecommendedFields(data), data), [data]);

  function updateField(name: keyof GuideData, value: string) {
    setData((current) => ({ ...current, [name]: value }));
    setError('');
    setStatus('');
  }

  function selectProfile(type: AssessmentType) {
    updateField('assessmentType', type);
  }

  function chooseWorkflow(mode: Exclude<WorkflowMode, ''>) {
    setWorkflow(mode);
    setError('');
    setStatus(mode === 'ai'
      ? 'AI-assisted route selected. Use the three steps below to start from your syllabus.'
      : 'Manual route selected. Your entries and selected filename remain on this device.');
  }

  async function copyAiPrompt() {
    try {
      await navigator.clipboard.writeText(aiExtractionPrompt);
      setStatus('Extraction instructions copied. Open ChatGPT, attach the syllabus, paste the instructions and add any extra information.');
      setError('');
    } catch {
      setError('Your browser could not copy automatically. Select and copy the instructions shown below.');
    }
  }

  function importAiResponse() {
    if (!aiResponse.trim()) {
      setError('Paste the structured response from ChatGPT first.');
      return;
    }
    try {
      const imported = parseAiGuide(aiResponse);
      const merged = { ...data, ...imported } as GuideData;
      const remaining = missingFrom(essentialFields, merged);
      setData(merged);
      setAiImported(true);
      setConfirmed(false);
      setStep(remaining[0]?.step || 4);
      setError('');
      setStatus(remaining.length
        ? `Imported the syllabus information. Only ${remaining.length} essential ${remaining.length === 1 ? 'item remains' : 'items remain'} for you to complete.`
        : 'Imported the syllabus information. All essential fields are complete; please review them before downloading.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('I could not read that response. Ask ChatGPT to return only the JSON object, then copy the complete response again.');
    }
  }

  function validateCurrentStep() {
    if (step === 1 && !data.assessmentType) return 'Choose one assessment profile to continue.';
    if (step === 2) {
      if (!data.moduleCode.trim() || !data.moduleTitle.trim() || !data.moduleLeader.trim()) {
        return 'Add the module code, module title and module leader to continue.';
      }
    }
    if (step === 3) {
      const required = [
        data.assessmentStructure,
        data.assessmentPurpose,
        data.expectations,
        data.criteria,
        data.preparation,
        data.feedbackAvailable,
        data.usingFeedback,
      ];
      if (required.some((value) => !value.trim())) {
        return 'Complete the required guidance fields before reviewing the guide.';
      }
    }
    return '';
  }

  function nextStep() {
    const message = validateCurrentStep();
    if (message) {
      setError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onSyllabus(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    updateField('syllabusName', file?.name || '');
  }

  async function downloadGuide(showStatus = true) {
    if (!confirmed) {
      setError('Confirm that you have checked the information before downloading the guide.');
      return null;
    }
    setStatus('Creating your editable Word document…');
    const result = await createGuideDocument(data);
    triggerDownload(result.blob, result.filename);
    if (showStatus) setStatus(`Downloaded ${result.filename}`);
    return result.filename;
  }

  async function prepareEmail() {
    const recipient = spoEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(recipient)) {
      setError('Enter the approved SPO email address before preparing the email.');
      return;
    }
    if (pdCc.trim() && !/^\S+@\S+\.\S+$/.test(pdCc.trim())) {
      setError('Check the optional Programme Director CC email address.');
      return;
    }
    const filename = await downloadGuide(false);
    if (!filename) return;
    const subject = `${data.moduleCode} ${data.moduleTitle} – Assessment and Feedback Guide`.trim();
    const body = [
      'Dear colleague,',
      '',
      `Please find the completed assessment and feedback guide for ${data.moduleCode} ${data.moduleTitle}.`,
      '',
      `Please attach the downloaded file before sending: ${filename}`,
      '',
      'Best wishes,',
      data.moduleLeader,
    ].join('\n');
    const query = new URLSearchParams({ subject, body });
    if (pdCc.trim()) query.set('cc', pdCc.trim());
    setStatus('The editable guide has downloaded. Your email application is opening—attach the downloaded file before sending.');
    window.location.href = `mailto:${encodeURIComponent(recipient)}?${query.toString()}`;
  }

  function resetForm() {
    if (!window.confirm('Clear this module guide and start again?')) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setData(emptyGuide);
    setConfirmed(false);
    setStep(1);
    setError('');
    setStatus('Draft cleared.');
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">K</div>
        <div>
          <p className="brand-line">King’s Business School</p>
          <p className="brand-subline">Programme enhancement toolkit</p>
        </div>
        <span className={`privacy-pill ${workflow === 'ai' ? 'ai-active' : ''}`}>
          {workflow === 'ai' ? 'ChatGPT-assisted route' : workflow === 'manual' ? 'Manual route · local draft' : 'Manual or AI-assisted'}
        </span>
      </header>

      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="kicker">Module guide generator</p>
          <h1>Create a clear assessment and feedback guide</h1>
          <p className="lede">
            Start from your syllabus with ChatGPT, or complete the guide manually. Check the result and download an editable Word document.
          </p>
        </div>
        {workflow ? (
          <div className="step-indicator" aria-label={`Step ${step} of 4`}>
            <span>Step {step} of 4</span>
            <div className="progress-track"><span style={{ width: `${step * 25}%` }} /></div>
            <strong>{steps[step - 1]}</strong>
          </div>
        ) : (
          <div className="step-indicator route-summary">
            <span>Choose your route</span>
            <strong>AI-assisted or manual</strong>
            <small>You can switch routes without losing your draft.</small>
          </div>
        )}
      </section>

      {!workflow ? (
        <section className="route-picker" aria-labelledby="route-heading">
          <div className="section-heading">
            <div>
              <p className="section-number">START HERE</p>
              <h2 id="route-heading">How would you like to complete the guide?</h2>
            </div>
            <p>Both routes produce the same editable Word document.</p>
          </div>
          <div className="route-grid">
            <button type="button" className="route-card recommended" onClick={() => chooseWorkflow('ai')}>
              <span className="route-badge">Recommended</span>
              <strong>Start from my syllabus with ChatGPT</strong>
              <p>Use your own ChatGPT account to extract the available information. Return here and complete only what is missing.</p>
              <span className="route-action">Choose AI-assisted route <i>→</i></span>
            </button>
            <button type="button" className="route-card" onClick={() => chooseWorkflow('manual')}>
              <span className="route-badge neutral">No AI</span>
              <strong>Complete the form manually</strong>
              <p>Use the existing structured form. Your entries and selected filename remain in this browser.</p>
              <span className="route-action">Choose manual route <i>→</i></span>
            </button>
          </div>
          <p className="safety-line">Do not upload student work or identifiable student information in either route.</p>
        </section>
      ) : <>

      <div className="workflow-strip">
        <div>
          <span>{workflow === 'ai' ? 'AI-assisted route' : 'Manual route'}</span>
          <strong>{workflow === 'ai' ? 'Start with ChatGPT, then review here' : 'Complete the structured form yourself'}</strong>
        </div>
        <button type="button" onClick={() => { setWorkflow(''); setError(''); setStatus(''); }}>Change route</button>
      </div>

      {workflow === 'ai' && (
        <section className="ai-assist" aria-labelledby="ai-assist-heading">
          <div className="ai-assist-heading">
            <div>
              <p className="section-number">AI ASSISTANT</p>
              <h2 id="ai-assist-heading">Let ChatGPT prepare the first draft</h2>
            </div>
            <p>ChatGPT does the extraction; this site checks what is still missing.</p>
          </div>

          <ol className="ai-steps">
            <li><span>1</span><div><strong>Copy the extraction instructions</strong><small>They tell ChatGPT not to invent missing information.</small></div></li>
            <li><span>2</span><div><strong>Open ChatGPT and attach your syllabus</strong><small>Paste the instructions and add any other module information you wish.</small></div></li>
            <li><span>3</span><div><strong>Paste ChatGPT’s response below</strong><small>The form will fill itself and identify only the remaining questions.</small></div></li>
          </ol>

          <div className="ai-actions">
            <button type="button" className="primary-button" onClick={() => void copyAiPrompt()}>Copy extraction instructions</button>
            <a className="secondary-button link-button" href="https://chatgpt.com/" target="_blank" rel="noreferrer">Open ChatGPT</a>
          </div>

          <details className="prompt-details">
            <summary>View or manually copy the extraction instructions</summary>
            <textarea readOnly value={aiExtractionPrompt} rows={10} aria-label="ChatGPT extraction instructions" />
          </details>

          <label className="ai-response" htmlFor="ai-response">
            <span>Paste ChatGPT’s structured response</span>
            <textarea
              id="ai-response"
              value={aiResponse}
              onChange={(event) => setAiResponse(event.target.value)}
              rows={8}
              placeholder={'Paste the complete JSON response here, beginning with { and ending with }'}
            />
          </label>
          <button type="button" className="import-button" onClick={importAiResponse}>Fill the form and check what is missing</button>

          {aiImported && (
            <div className="missing-review" aria-live="polite">
              <div>
                <strong>{essentialMissing.length ? `${essentialMissing.length} essential ${essentialMissing.length === 1 ? 'item' : 'items'} still needed` : 'All essential information is present'}</strong>
                <p>{essentialMissing.length ? 'The form will take you directly to these questions.' : 'Review the imported wording and edit anything that needs refinement.'}</p>
              </div>
              {essentialMissing.length > 0 && <ul>{essentialMissing.map((item) => <li key={item.name}>{item.label}</li>)}</ul>}
              {recommendedMissing.length > 0 && (
                <details>
                  <summary>{recommendedMissing.length} optional refinements are still blank</summary>
                  <ul>{recommendedMissing.map((item) => <li key={item.name}>{item.label}</li>)}</ul>
                </details>
              )}
            </div>
          )}

          <p className="ai-privacy"><strong>Privacy:</strong> the syllabus is uploaded to your own ChatGPT conversation, not to this website. ChatGPT Free accounts support file uploads subject to their current usage limits. Check your account’s data controls before using work documents.</p>
        </section>
      )}

      <nav className="step-nav" aria-label="Form progress">
        {steps.map((label, index) => {
          const number = index + 1;
          return (
            <button
              key={label}
              type="button"
              className={number === step ? 'active' : number < step ? 'complete' : ''}
              onClick={() => number < step && setStep(number)}
              disabled={number > step}
            >
              <span>{number < step ? '✓' : number}</span>{label}
            </button>
          );
        })}
      </nav>

      {error && <div className="message error-message" role="alert">{error}</div>}
      {status && <div className="message status-message" role="status">{status}</div>}

      <form className="workspace" onSubmit={(event) => event.preventDefault()}>
        {step === 1 && (
          <section aria-labelledby="assessment-heading">
            <div className="section-heading">
              <div>
                <p className="section-number">01</p>
                <h2 id="assessment-heading">How is this module assessed?</h2>
              </div>
              <p>Select the closest profile. Later prompts will adapt to this choice.</p>
            </div>

            <div className="assessment-grid">
              {assessmentTypes.map((type) => (
                <button
                  className={`assessment-card ${data.assessmentType === type.id ? 'selected' : ''}`}
                  key={type.id}
                  type="button"
                  onClick={() => selectProfile(type.id)}
                  aria-pressed={data.assessmentType === type.id}
                >
                  <span className="card-topline"><span>{type.eyebrow}</span><b>{type.marker}</b></span>
                  <strong>{type.title}</strong>
                  <small>{type.description}</small>
                  <span className="select-line">{data.assessmentType === type.id ? 'Selected' : 'Choose this profile'} <i>→</i></span>
                </button>
              ))}
            </div>

            <div className="local-note">
              <span aria-hidden="true">✓</span>
              {workflow === 'manual' ? (
                <p><strong>Your information stays on this device.</strong> The manual route does not upload syllabi or responses to a server.</p>
              ) : (
                <p><strong>ChatGPT supplied the first draft.</strong> Review the assessment profile and correct it if the syllabus was ambiguous.</p>
              )}
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="details-heading">
            <div className="section-heading">
              <div>
                <p className="section-number">02</p>
                <h2 id="details-heading">Module details</h2>
              </div>
              <p>These fields identify the guide and appear at the beginning of the Word document.</p>
            </div>

            <div className="form-grid">
              <InputField label="Module code" name="moduleCode" value={data.moduleCode} onChange={updateField} placeholder="e.g. 5SSMN225" required />
              <InputField label="Module title" name="moduleTitle" value={data.moduleTitle} onChange={updateField} placeholder="e.g. Intermediate Econometrics" required />
              <label className="field" htmlFor="field-level">
                <span>Level</span>
                <select id="field-level" value={data.level} onChange={(event) => updateField('level', event.target.value)}>
                  <option value="">Select level</option>
                  <option>Level 4</option><option>Level 5</option><option>Level 6</option><option>Level 7</option>
                </select>
              </label>
              <InputField label="Department" name="department" value={data.department} onChange={updateField} placeholder="e.g. Economics" />
              <InputField label="Module leader" name="moduleLeader" value={data.moduleLeader} onChange={updateField} placeholder="Full name" required />
              <InputField label="Academic year" name="academicYear" value={data.academicYear} onChange={updateField} placeholder="2026/27" />
              <InputField label="Teaching period" name="teachingPeriod" value={data.teachingPeriod} onChange={updateField} placeholder="e.g. Semester 1" />
              <div className="field upload-field">
                <span>Module syllabus or outline</span>
                <label className="upload-control" htmlFor="syllabus-upload">
                  <b>{data.syllabusName ? 'Replace file' : 'Choose PDF or Word file'}</b>
                  <small>{data.syllabusName || 'No file selected'}</small>
                </label>
                <input id="syllabus-upload" className="visually-hidden" type="file" accept=".pdf,.doc,.docx" onChange={onSyllabus} />
                <small>{workflow === 'ai' ? 'This selector records the filename only. Attach the actual syllabus in your ChatGPT conversation.' : 'The file remains on your device and is not read automatically.'}</small>
              </div>
              <TextAreaField
                label="Additional source information"
                name="sourceNotes"
                value={data.sourceNotes}
                onChange={updateField}
                placeholder="Paste any relevant information that is not already captured below."
                rows={4}
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="guidance-heading">
            <div className="section-heading">
              <div>
                <p className="section-number">03</p>
                <h2 id="guidance-heading">Guidance content</h2>
              </div>
              <p>You selected <strong>{selectedProfile?.eyebrow}</strong>. Write for students and use plain, specific language.</p>
            </div>

            <div className="profile-banner">
              <span>{selectedProfile?.marker}</span>
              <div><strong>{selectedProfile?.title}</strong><small>{selectedProfile?.description}</small></div>
              <button type="button" onClick={() => setStep(1)}>Change</button>
            </div>

            <fieldset>
              <legend>Assessment overview</legend>
              <div className="form-grid">
                <TextAreaField label="Assessment structure and weighting" name="assessmentStructure" value={data.assessmentStructure} onChange={updateField} placeholder="List the assessment components, format and weighting." required />
                <TextAreaField label="Purpose of the assessment" name="assessmentPurpose" value={data.assessmentPurpose} onChange={updateField} placeholder="Explain what the assessment is designed to test and why." required />

                {data.assessmentType === 'exam' && <>
                  <TextAreaField label="Examination format and duration" name="examFormat" value={data.examFormat} onChange={updateField} placeholder="e.g. Two-hour closed-book examination; section structure and question choice." />
                  <TextAreaField label="Coverage and relationship to teaching" name="examCoverage" value={data.examCoverage} onChange={updateField} placeholder="Clarify examinable material and how lectures/tutorials support preparation." />
                  <TextAreaField label="Conditions and permitted materials" name="examConditions" value={data.examConditions} onChange={updateField} placeholder="State calculator, formula sheet, reference or other conditions." />
                </>}

                {data.assessmentType === 'mixed' && <>
                  <TextAreaField label="Relationship between components" name="mixedRelationship" value={data.mixedRelationship} onChange={updateField} placeholder="Explain how coursework and examination components complement one another." />
                  <TextAreaField label="Sequencing and learning across components" name="mixedSequence" value={data.mixedSequence} onChange={updateField} placeholder="Explain how earlier work or feedback prepares students for later assessment." />
                </>}

                {data.assessmentType === 'coursework' && <>
                  <TextAreaField label="Milestones and formative opportunities" name="courseworkMilestones" value={data.courseworkMilestones} onChange={updateField} placeholder="State proposal, draft, workshop, presentation or other preparation points." />
                  <TextAreaField label="Submission requirements" name="courseworkSubmission" value={data.courseworkSubmission} onChange={updateField} placeholder="State format, length, referencing, group/individual requirements and submission route." />
                </>}
              </div>
            </fieldset>

            <fieldset>
              <legend>Expectations and preparation</legend>
              <div className="form-grid">
                <TextAreaField label="What students are expected to demonstrate" name="expectations" value={data.expectations} onChange={updateField} placeholder="Describe the knowledge, analysis and application expected." required />
                <TextAreaField label="How the criteria will be applied" name="criteria" value={data.criteria} onChange={updateField} placeholder="Translate the marking criteria into clear expectations for this task." required />
                <TextAreaField label="How students should prepare" name="preparation" value={data.preparation} onChange={updateField} placeholder="Give a practical sequence for preparation." required />
                <TextAreaField label="Worked examples, practice and readiness support" name="workedExamples" value={data.workedExamples} onChange={updateField} placeholder="Identify examples, practice questions, Q&A, workshops or tutorial activity." />
                <TextAreaField label="Common pitfalls" name="commonPitfalls" value={data.commonPitfalls} onChange={updateField} placeholder="List recurring misunderstandings or avoidable mistakes." />
              </div>
            </fieldset>

            <fieldset>
              <legend>Feedback and support</legend>
              <div className="form-grid">
                <TextAreaField label="Feedback students will receive" name="feedbackAvailable" value={data.feedbackAvailable} onChange={updateField} placeholder="State the format, timing and location of feedback, including cohort-level feedback." required />
                <TextAreaField label="How students should use the feedback" name="usingFeedback" value={data.usingFeedback} onChange={updateField} placeholder="Explain how feedback should inform later work or future performance." required />
                <TextAreaField label="Support and contact routes" name="supportRoutes" value={data.supportRoutes} onChange={updateField} placeholder="State relevant office hours, tutorials, forums or contacts." />
                <InputField label="KEATS or module link" name="keatsLink" value={data.keatsLink} onChange={updateField} placeholder="https://…" type="url" />
              </div>
            </fieldset>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="review-heading">
            <div className="section-heading">
              <div>
                <p className="section-number">04</p>
                <h2 id="review-heading">Review and share</h2>
              </div>
              <p>Check the content below. The downloaded Word document remains fully editable.</p>
            </div>

            <article className="document-preview">
              <header>
                <p>King’s Business School</p>
                <h3>Module Assessment and Feedback Guide</h3>
                <span>{data.moduleCode} · {data.moduleTitle}</span>
              </header>
              <dl className="preview-meta">
                <PreviewItem label="Assessment profile" value={data.assessmentType ? assessmentLabels[data.assessmentType] : ''} />
                <PreviewItem label="Module leader" value={data.moduleLeader} />
                <PreviewItem label="Assessment structure" value={data.assessmentStructure} />
                <PreviewItem label="Purpose" value={data.assessmentPurpose} />
                <PreviewItem label="Expectations" value={data.expectations} />
                <PreviewItem label="Preparation" value={data.preparation} />
                <PreviewItem label="Feedback" value={data.feedbackAvailable} />
                <PreviewItem label="Using feedback" value={data.usingFeedback} />
              </dl>
              <button className="text-button" type="button" onClick={() => setStep(3)}>Edit guidance content</button>
            </article>

            <label className="confirmation">
              <input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setError(''); }} />
              <span><strong>I have checked the information for accuracy.</strong> I understand that the module leader remains responsible for the final content.</span>
            </label>

            <div className="delivery-grid">
              <section className="delivery-card primary-delivery">
                <span className="delivery-number">A</span>
                <h3>Download editable guide</h3>
                <p>Create a Word document that can be edited, saved to SharePoint or uploaded to KEATS.</p>
                <button type="button" className="primary-button" onClick={() => void downloadGuide()}>Download Word document</button>
              </section>

              <section className="delivery-card">
                <span className="delivery-number">B</span>
                <h3>Prepare email to SPO</h3>
                <p>The guide downloads first. Your email application then opens with a prepared message; attach the downloaded document before sending.</p>
                <label className="mini-field">SPO email address
                  <input type="email" value={spoEmail} onChange={(event) => setSpoEmail(event.target.value)} placeholder="approved-address@kcl.ac.uk" />
                </label>
                <label className="mini-field">Programme Director CC (optional)
                  <input type="email" value={pdCc} onChange={(event) => setPdCc(event.target.value)} placeholder="optional-address@kcl.ac.uk" />
                </label>
                <button type="button" className="secondary-button" onClick={() => void prepareEmail()}>Download and prepare email</button>
              </section>
            </div>
          </section>
        )}

        <footer className="form-actions">
          <button type="button" className="text-button danger" onClick={resetForm}>Clear draft</button>
          <div>
            {step > 1 && <button type="button" className="back-button" onClick={previousStep}>Back</button>}
            {step < 4 && <button type="button" className="primary-button" onClick={nextStep}>Continue</button>}
          </div>
        </footer>
      </form>
      </>}

      <footer className="site-footer">
        <p>Manual completion or ChatGPT-assisted syllabus extraction</p>
        <p>Do not enter identifiable student information or upload student work.</p>
      </footer>
    </main>
  );
}
