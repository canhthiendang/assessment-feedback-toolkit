import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createToolkitDocument } from '../app/docx-generator';
import { ToolkitData, emptyData } from '../app/types';

const base: ToolkitData = {
  ...emptyData, moduleCode:'7ECON001W', moduleTitle:'Applied Economics and Management', level:'Level 6', faculty:"King's Business School",
  department:'Economics', moduleLeader:'Dr Sample Leader', academicYear:'2026/27', teachingPeriod:'Semester 2',
  assessmentProfile:'mixed', assessmentFormat:'econometrics_project', assessmentStructure:'A 2,500-word empirical project worth 60%, supported by a time-limited examination worth 40%.',
  assessmentPurpose:'The project assesses the full empirical reasoning chain: a motivated question, appropriate data and specification, reproducible analysis, interpretation, diagnostic judgement and honest discussion of limitations.',
  assessmentRequirements:'Use the approved dataset or document any alternative source. Submit the report and reproducible code by the published deadline. Follow the module rules on permitted AI use and disclosure.',
  expectations:'Strong work explains why the design can answer the question, documents data decisions, interprets magnitude and uncertainty, and distinguishes association from causal evidence.',
  criteria:'Markers apply the current rubric across economic reasoning, empirical design, execution, interpretation, critical judgement and communication.',
  preparation:'Reproduce workshop analyses independently, practise selecting specifications, and use the rubric to review one complete draft.',
  workedExamples:'A workshop compares a descriptive coefficient statement with an interpretation that explains magnitude, uncertainty, assumptions and limitations.',
  commonPitfalls:'Avoid reporting output without interpretation, changing specifications without justification, overstating causal claims or omitting reproducibility details.',
  feedbackAvailable:'Students receive rubric indicators, individual comments and a cohort-level summary of recurring strengths and improvement priorities.',
  usingFeedback:'Turn each feedback theme into one concrete action and revisit it before the next empirical module or dissertation milestone.',
  supportRoutes:'A cohort debrief and office hour will be announced on KEATS.', keatsLocation:'KEATS > Assessment > Assessment and feedback resources',
  cohortContext:'This document summarises non-identifiable themes across the cohort and complements individual feedback.',
  evaluatedLearning:'The assessment evaluated economic reasoning, empirical design, appropriate use of methods, interpretation, critical judgement and clear communication.',
  performancePatterns:'Responses were generally strongest where students stated the mechanism and empirical purpose before interpreting the results. No numeric summary is included here.',
  cohortStrengths:'Many students selected relevant concepts, organised their analysis clearly and interpreted the main result in relation to the research question.',
  improvementAreas:'The main priority is to make identifying assumptions and limitations explicit and to explain why each specification change is analytically useful.',
  criteriaApplication:'Higher-performing work combined technical accuracy with justified choices and proportionate conclusions; output volume alone did not demonstrate stronger analysis.',
  improvedApproaches:'Instead of saying a coefficient is significant, explain its sign, magnitude, uncertainty, identifying assumptions and what the estimate does—and does not—support.',
  futureUse:'Use a short check before later work: question answered, method justified, assumptions visible, evidence interpreted and conclusion proportionate.',
  debriefSupport:'Bring one output table and one feedback point to the cohort debrief, and identify one analytical decision you would make differently.',
};

const output = new URL('../artifacts/validation-docx/', import.meta.url);
await mkdir(output, { recursive:true });
const logoBuffer = await readFile(new URL('../public/kcl-logo.png', import.meta.url));
for (const [stage,brand,suffix] of [['before','kcl','kcl-before'],['before','generic','generic-before'],['after','kcl','kcl-after'],['after','generic','generic-after']] as const) {
  const result = await createToolkitDocument(base, stage, brand, brand === 'kcl' ? logoBuffer.buffer.slice(logoBuffer.byteOffset, logoBuffer.byteOffset + logoBuffer.byteLength) : undefined);
  await writeFile(new URL(`${suffix}.docx`, output), new Uint8Array(await result.blob.arrayBuffer()));
}
