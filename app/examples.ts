import { AssessmentFormat, DocumentStage, ToolkitData, formatLabels } from './types';

type ExampleBank = Partial<Record<keyof ToolkitData, string[]>>;
const commonBefore: ExampleBank = {
  expectations: ['A strong response identifies the relevant economic mechanism, applies it to the question, and explains why the evidence supports the conclusion rather than merely naming a theory.', 'Good performance combines accurate analysis with explicit assumptions, proportionate evidence and a clear line of reasoning.'],
  criteria: ['Markers will consider accuracy, analytical reasoning, appropriate use of evidence, application to the task and clarity of communication. A technically correct answer may still be limited if its assumptions or implications are not explained.'],
  preparation: ['Practise selecting an approach before looking at a solution, complete representative questions under realistic conditions, and compare your reasoning with the rubric or model approach.'],
  workedExamples: ['Use a short worked example to show how a descriptive answer can be improved by adding a mechanism, assumptions, evidence and a justified conclusion.'],
  commonPitfalls: ['Common pitfalls include answering a nearby question, reproducing material without applying it, leaving assumptions implicit, reporting output without interpretation, and allocating time or words unevenly.'],
  feedbackAvailable: ['Students will receive individual comments and/or rubric indicators, supported by a cohort-level summary explaining recurring strengths, misconceptions and practical next steps.'],
  usingFeedback: ['Translate each feedback point into one action: what to continue, what to change, and where to practise it. Revisit this plan before the next related assessment.'],
};
const commonAfter: ExampleBank = {
  cohortContext: ['This document summarises non-identifiable themes across the cohort. It complements individual feedback and does not replace comments on your own work.'],
  performancePatterns: ['Responses were generally strongest when students stated the economic mechanism before applying evidence. Do not add percentages or averages unless they have been checked and supplied by the module team.'],
  cohortStrengths: ['Many students selected relevant concepts and structured their responses clearly. Stronger work made the link between evidence and conclusion explicit.'],
  improvementAreas: ['The main opportunity is to move from description to analysis: explain the causal or strategic mechanism, state assumptions and consider the limits of the conclusion.'],
  criteriaApplication: ['Higher-performing work combined accuracy with application and judgement. The rubric was applied holistically: listing more material did not compensate for weak relevance or unexplained reasoning.'],
  improvedApproaches: ['Instead of stating that a coefficient is significant, explain its sign, magnitude, uncertainty, identifying assumptions and what the result does—and does not—support.'],
  futureUse: ['Carry this feedback into later modules by using a short pre-submission check: question answered, method justified, assumptions visible, evidence interpreted and conclusion proportionate.'],
  debriefSupport: ['Bring one paragraph, calculation or feedback point to the debrief and identify the decision you would make differently next time.'],
};
const formatBefore: Record<AssessmentFormat, ExampleBank> = {
  in_person_exam: { assessmentPurpose: ['An in-person examination is appropriate because it asks students to apply core concepts independently under time constraints, demonstrate fluency in economic or quantitative reasoning, and select and justify a method in comparable conditions. Foundational fluency also helps graduates evaluate rather than simply accept AI-generated analysis.'], preparation: ['Use timed, closed-resource practice after untimed learning. Practise identifying the method, showing essential workings and explaining the economic meaning of the result.'], assessmentRequirements: ['Answer the specified number of questions. State essential assumptions, show material workings, label diagrams and follow the published rules on permitted materials.'] },
  open_book_exam: { assessmentPurpose: ['A time-limited open-book examination assesses selection, application and judgement rather than recall alone. Access to resources makes it especially important to decide what is relevant and construct a defensible answer efficiently.'], preparation: ['Organise resources by decision or concept, not by week. Practise locating evidence quickly and answering unfamiliar questions without copying notes into the response.'] },
  essay_report: { assessmentPurpose: ['The essay or report assesses the ability to frame a focused question, integrate theory and evidence, evaluate competing explanations and communicate a reasoned conclusion for an academic or professional reader.'], expectations: ['Strong work has a clear analytical spine: each section advances the answer, evidence is evaluated rather than accumulated, and the conclusion follows from the argument.'] },
  quant_problem_set: { assessmentPurpose: ['The problem set develops quantitative fluency by requiring students to choose and execute an appropriate method, show reasoning, interpret results and diagnose whether an answer is economically plausible.'], commonPitfalls: ['Avoid presenting calculations without interpretation, rounding too early, omitting units, using a method without checking its conditions, or treating software output as self-explanatory.'] },
  econometrics_project: { assessmentPurpose: ['The data project assesses the full empirical reasoning chain: a motivated question, appropriate data and specification, reproducible analysis, interpretation, diagnostic judgement and honest discussion of limitations.'], expectations: ['Good performance explains why the design can answer the question, documents data decisions, interprets magnitude and uncertainty, and distinguishes association from causal evidence.'] },
  case_analysis: { assessmentPurpose: ['Case analysis assesses whether students can diagnose an ambiguous organisational or market problem, prioritise evidence, apply relevant frameworks selectively and recommend an implementable course of action.'], expectations: ['Strong work makes trade-offs explicit and explains why the recommended action is preferable under the case constraints.'] },
  presentation: { assessmentPurpose: ['The presentation assesses disciplined selection, audience-aware communication, evidence-based judgement and the ability to explain or defend analysis within a limited time.'], preparation: ['Rehearse aloud to time, test the narrative without slides, and prepare concise answers to likely questions about assumptions, evidence and recommendations.'] },
  group_project: { assessmentPurpose: ['The group project combines subject knowledge with coordination, integration of different contributions and collective responsibility for a coherent analytical output—capabilities used in professional economics and management work.'], commonPitfalls: ['Avoid dividing the task into disconnected pieces, leaving integration until the end, or allowing presentation consistency to substitute for analytical coherence.'] },
  take_home: { assessmentPurpose: ['A take-home task allows sustained analysis of a more complex problem. It assesses judgement in selecting methods and evidence, transparent use of permitted tools, and the ability to refine a coherent response within the stated rules.'], assessmentRequirements: ['Follow the module’s rules on collaboration, sources and AI tools. Where AI use is permitted, verify outputs, disclose use as required and remain responsible for every claim, calculation and citation.'] },
};

export function examplesFor(stage: DocumentStage, format: AssessmentFormat | ''): ExampleBank {
  const base = stage === 'before' ? commonBefore : commonAfter;
  if (stage === 'after' || !format) return base;
  const merged: ExampleBank = { ...base };
  for (const [key, values] of Object.entries(formatBefore[format])) merged[key as keyof ToolkitData] = [...(base[key as keyof ToolkitData] || []), ...(values || [])];
  return merged;
}

export function aiPrompt(stage: DocumentStage, format: AssessmentFormat | '') {
  const formatText = format ? formatLabels[format] : 'the assessment format supported by the source material';
  const shared = `You are helping a university module leader create an editable student-facing document for an undergraduate economics or management module. Use only the supplied sources. Useful sources include the approved syllabus or module outline, course aims and learning outcomes, assessment brief or specification, current marking guide or marking scheme, and current marking rubric or assessment criteria. Do not invent facts, dates, rules, links, grade boundaries, marking-band labels, statistics or cohort results. Leave unsupported values empty. Use concise, constructive language and a feedback-for-learning approach: help students recognise quality, diagnose their next step and transfer learning to future work. Do not include student names, IDs, individual scripts, raw marks, named comments or identifiable student information.

Where the supplied marking guide, rubric and learning objectives support it, devise three contrasting illustrative tiers of answer or approach. Use the exact band labels only when the supplied rubric provides them; otherwise use neutral labels such as developing, secure and strong. Explain what each tier does, how it meets the criteria and what specific change would improve it. Use a generic, staff-created or properly anonymised example. Do not reproduce a secure live assessment question or a full solution unless the source explicitly confirms it is approved for student release. Do not present the AI-generated text as an official model answer.

Return ONLY one valid JSON object with string values and no markdown.`;
  if (stage === 'before') return `${shared}\n\nCreate an Assessment and Feedback Guide for ${formatText}. Use tiered illustrations in workedExamples and explain how the supplied criteria distinguish levels of performance in criteria. Use exactly these keys:\n${JSON.stringify({ moduleCode:'', moduleTitle:'', level:'', faculty:'', department:'', moduleLeader:'', academicYear:'', teachingPeriod:'', assessmentProfile:'', assessmentFormat:format, assessmentStructure:'', assessmentPurpose:'', expectations:'', criteria:'', preparation:'', workedExamples:'', commonPitfalls:'', assessmentRequirements:'', feedbackAvailable:'', usingFeedback:'', supportRoutes:'', keatsLocation:'' }, null, 2)}\n\nUse assessmentProfile values exam, mixed or coursework. Explain the educational purpose without claiming the format is inherently superior or valuable merely because it restricts AI. Distinguish supported information from gaps by leaving gaps empty.`;
  return `${shared}\n\nCreate a cohort-level General Feedback document for ${formatText}. In addition to the approved syllabus, learning outcomes, marking guide and rubric, use only checked, anonymised aggregate cohort themes. Never infer or calculate performance statistics; include a numeric pattern only when explicitly supplied and checked. Use tiered illustrations in improvedApproaches and explain how the supplied criteria distinguished performance in criteriaApplication. Use exactly these keys:\n${JSON.stringify({ moduleCode:'', moduleTitle:'', level:'', faculty:'', department:'', moduleLeader:'', academicYear:'', teachingPeriod:'', assessmentProfile:'', assessmentFormat:format, cohortContext:'', evaluatedLearning:'', performancePatterns:'', cohortStrengths:'', improvementAreas:'', criteriaApplication:'', improvedApproaches:'', futureUse:'', debriefSupport:'', keatsLocation:'' }, null, 2)}\n\nUse assessmentProfile values exam, mixed or coursework. Make clear that cohort feedback complements rather than replaces individual feedback. Leave unsupported values empty.`;
}

const beforeAiSample = {
  moduleCode: 'DEMO2001',
  moduleTitle: 'Applied Microeconomics (fictional example)',
  level: 'Level 5',
  faculty: 'Example Business School',
  department: 'Economics',
  moduleLeader: 'Dr Alex Morgan',
  academicYear: '2026/27',
  teachingPeriod: 'Term 1',
  assessmentProfile: 'exam',
  assessmentFormat: 'in_person_exam',
  assessmentStructure: 'Fictional example: a two-hour, closed-book examination made up of analytical, quantitative and applied questions. The final document should replace this text with the approved structure and weighting.',
  assessmentPurpose: 'The examination assesses whether students can select and apply relevant microeconomic concepts independently, show essential analytical or quantitative reasoning and explain the economic meaning of their conclusions. It tests fluent application and judgement rather than recall alone.',
  expectations: 'Students should identify the relevant economic mechanism, state necessary assumptions, use diagrams or calculations accurately, interpret the result in context and reach a conclusion supported by their analysis.',
  criteria: 'The fictional rubric considers accuracy, relevance, analytical method, application, interpretation and clarity. Developing work identifies a relevant idea but applies it incompletely. Secure work applies an appropriate model accurately and explains the main result. Strong work integrates method, economic intuition, assumptions and a proportionate evaluation.',
  preparation: 'Begin with untimed practice to consolidate methods, then complete representative questions under timed and closed-resource conditions. Compare each response with the rubric and identify one improvement to reasoning, execution or interpretation.',
  workedExamples: 'Use a generic market-intervention question. Developing approach: names the relevant model but leaves the mechanism and conclusion unexplained; next step—show how the intervention changes incentives and outcomes. Secure approach: applies the model correctly and interprets the central result; next step—make assumptions explicit. Strong approach: integrates a clear diagram or calculation, economic intuition, assumptions, implications and a concise limitation.',
  commonPitfalls: 'Common pitfalls include answering a nearby question, omitting material workings, leaving diagrams unlabelled, stating a numerical result without interpretation, treating assumptions as facts and allocating time without regard to the marks available.',
  assessmentRequirements: 'Follow the approved examination instructions, answer the required number of questions, show material workings, label diagrams and use only permitted resources. Replace this fictional wording with the module’s current requirements.',
  feedbackAvailable: 'Students will receive the feedback specified by the module, supported where appropriate by a cohort-level explanation of common strengths, misconceptions and practical next steps.',
  usingFeedback: 'Compare your approach with the criteria and tiered illustration. Identify what to continue, one feature to improve and a specific practice task to complete before the next related assessment.',
  supportRoutes: 'Use the module’s published question-and-answer, office-hour or debrief arrangements. Replace this fictional wording with the confirmed support route.',
  keatsLocation: 'Module learning platform > Assessment and feedback'
};

const afterAiSample = {
  moduleCode: 'DEMO2001',
  moduleTitle: 'Applied Microeconomics (fictional example)',
  level: 'Level 5',
  faculty: 'Example Business School',
  department: 'Economics',
  moduleLeader: 'Dr Alex Morgan',
  academicYear: '2026/27',
  teachingPeriod: 'Term 1',
  assessmentProfile: 'exam',
  assessmentFormat: 'in_person_exam',
  cohortContext: 'This fictional example summarises non-identifiable cohort themes from a closed-book examination. Cohort feedback complements rather than replaces any individual feedback available to students.',
  evaluatedLearning: 'The examination assessed understanding of core microeconomic concepts and the ability to select an appropriate model, use diagrams or calculations, explain economic intuition and reach a supported conclusion.',
  performancePatterns: 'Responses were generally more effective when students selected the relevant model, showed the main stages of their reasoning and connected the result explicitly to the question. No numerical performance statistics are included in this fictional example.',
  cohortStrengths: 'The cohort generally demonstrated sound knowledge of the principal concepts. Stronger responses used appropriately labelled diagrams, set out calculations clearly and explained the implications for firms, consumers or policymakers.',
  improvementAreas: 'The main opportunity is to move from describing a model to using it to answer the precise question. Responses would be stronger with clearer definitions, visible workings, explicit assumptions and fuller interpretation of the result.',
  criteriaApplication: 'The fictional rubric considered accuracy, relevance, analytical method, application, interpretation and clarity. Developing responses identified some relevant material but did not complete the reasoning. Secure responses applied an appropriate model accurately and explained the main result. Strong responses integrated method, economic intuition, assumptions, implications and proportionate evaluation.',
  improvedApproaches: 'For a generic market-intervention question, a developing approach names the model but leaves the mechanism unexplained; the next step is to trace how incentives and outcomes change. A secure approach applies the model and interprets the central result; the next step is to state assumptions and limits. A strong approach integrates a clear diagram or calculation, economic intuition, assumptions, implications and a concise evaluation.',
  futureUse: 'Use this cohort feedback alongside any individual feedback. Identify whether your next step concerns knowledge, method selection, technical execution, interpretation or time management, then complete a focused practice task and check it against the rubric.',
  debriefSupport: 'A fictional cohort debrief and supporting materials would be signposted through the module’s usual feedback area. Replace this wording with confirmed arrangements before publication.',
  keatsLocation: 'Module learning platform > Assessment and feedback > General examination feedback'
};

export function sampleAiResponse(stage: DocumentStage) {
  return JSON.stringify(stage === 'before' ? beforeAiSample : afterAiSample, null, 2);
}
