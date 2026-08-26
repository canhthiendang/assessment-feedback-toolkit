import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const projectDir = path.resolve(import.meta.dirname, '..');
const bundledModule = path.resolve(projectDir, 'work', 'docx-generator-smoke.mjs');
const outputDir = path.resolve(projectDir, 'work', 'smoke-output');
const { createGuideDocument } = await import(pathToFileURL(bundledModule));

await mkdir(outputDir, { recursive: true });

const common = {
  moduleCode: 'ECON5000',
  moduleTitle: 'Demonstration Module',
  level: 'Level 5',
  department: 'Economics',
  moduleLeader: 'Test Module Leader',
  academicYear: '2026/27',
  teachingPeriod: 'Semester 1',
  syllabusName: 'demo-syllabus.docx',
  sourceNotes: 'Demonstration content for automated verification only.',
  assessmentStructure: 'A clearly stated assessment structure with component weightings.',
  assessmentPurpose: 'To assess understanding, analysis and application.',
  expectations: 'Students should demonstrate accurate analysis and clear application.',
  criteria: 'Criteria will be applied consistently to analysis, evidence and communication.',
  preparation: 'Review teaching materials, complete practice and use the readiness guidance.',
  workedExamples: 'A worked example and common-pitfalls discussion will be provided.',
  commonPitfalls: 'Incomplete interpretation and unsupported conclusions.',
  feedbackAvailable: 'Written feedback and a cohort-level debrief will be available.',
  usingFeedback: 'Students should identify two priorities to apply to later work.',
  supportRoutes: 'Tutorials, office hours and the KEATS discussion area.',
  keatsLink: 'https://keats.kcl.ac.uk/',
  examFormat: 'Two-hour examination.',
  examCoverage: 'Material taught in lectures and tutorials.',
  examConditions: 'Standard examination conditions.',
  mixedRelationship: 'Coursework develops skills assessed again in the examination.',
  mixedSequence: 'Coursework feedback informs examination preparation.',
  courseworkMilestones: 'Proposal workshop and formative outline.',
  courseworkSubmission: 'Individual written submission through KEATS.',
};

for (const assessmentType of ['exam', 'mixed', 'coursework']) {
  const { blob, filename } = await createGuideDocument({ ...common, assessmentType });
  const outputPath = path.join(outputDir, `${assessmentType}-${filename}`);
  await writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
  console.log(outputPath);
}
