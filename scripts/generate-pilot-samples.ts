import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createSlidesCompanionDocument } from '../app/docx-generator';
import { createAssessmentSlides } from '../app/pptx-generator';
import { ToolkitData, emptyData } from '../app/types';

const data: ToolkitData = {
  ...emptyData,
  moduleCode: 'DEMO2001', moduleTitle: 'Applied Microeconomics (fictional example)', level: 'Level 5', institution: 'Example University', faculty: 'Example Business School', department: 'Economics', moduleLeader: 'Dr Alex Morgan', academicYear: '2026/27', teachingPeriod: 'Term 1', assessmentProfile: 'exam', assessmentFormat: 'in_person_exam',
  assessmentStructure: 'Two-hour, closed-book examination with analytical, quantitative and applied questions. Replace this fictional text with the approved structure and weighting.',
  assessmentPurpose: 'The examination asks students to select and apply relevant microeconomic concepts independently, show essential reasoning and explain the economic meaning of their conclusions.',
  learningOutcomes: 'Explain how incentives shape market behaviour.\nApply an appropriate microeconomic model to an unfamiliar problem.\nInterpret analytical or quantitative results and reach a justified conclusion.',
  criteria: 'Accuracy and relevance.\nSelection and application of analytical method.\nInterpretation and clarity of communication.',
  fairnessAndClarity: 'Students receive the approved rubric and an assessment briefing. Practice questions clarify the expected reasoning. The module team follows the published moderation process.',
  feedbackAvailable: 'Rubric indicators and individual comments.\nA cohort-level summary of common strengths and misconceptions.\nA scheduled examination debrief.',
  usingFeedback: 'Compare your response with the criteria.\nIdentify one feature to retain and one change to make.\nComplete a focused practice task before the next related assessment.',
  skillsEmployability: 'Critical thinking: compare plausible models and justify the most appropriate one.\nQuantitative reasoning: show and interpret calculations.\nCommunication: explain economic reasoning clearly for the intended audience.\nAI literacy: evaluate tool-assisted claims against theory, evidence and the assessment rules.',
  preparation: 'Complete representative questions under timed conditions and compare your reasoning with the rubric.', workedExamples: 'Use a generic market-intervention question to compare developing, secure and strong reasoning.', commonPitfalls: 'Avoid answering a nearby question, omitting workings or reporting a result without interpretation.', assessmentRequirements: 'Follow the approved examination instructions and use only permitted resources.', supportRoutes: 'Use the published office hour and cohort debrief arrangements.', keatsLocation: 'Module learning platform > Assessment and feedback', missingInformation: 'Confirm all fictional details against current approved module documentation.',
};

const outputDir = path.resolve('artifacts/validation-pilot');
await mkdir(outputDir, { recursive: true });
const profileImage = await readFile(path.resolve('public/kbs-graduate-success-profile.png'));
const profileImageBuffer = profileImage.buffer.slice(profileImage.byteOffset, profileImage.byteOffset + profileImage.byteLength) as ArrayBuffer;
const [slides, companion] = await Promise.all([createAssessmentSlides(data, profileImageBuffer), createSlidesCompanionDocument(data, 'generic')]);
await writeFile(path.join(outputDir, slides.filename), Buffer.from(await slides.blob.arrayBuffer()));
await writeFile(path.join(outputDir, companion.filename), Buffer.from(await companion.blob.arrayBuffer()));
console.log(path.join(outputDir, slides.filename));
console.log(path.join(outputDir, companion.filename));
