export type DocumentStage = 'before' | 'after';
export type WorkflowMode = 'manual' | 'ai';
export type DocumentBrand = 'generic' | 'kcl';
export type AssessmentProfile = 'exam' | 'mixed' | 'coursework';

export type AssessmentFormat =
  | 'in_person_exam' | 'open_book_exam' | 'essay_report' | 'quant_problem_set'
  | 'econometrics_project' | 'case_analysis' | 'presentation' | 'group_project' | 'take_home';

export type ToolkitData = {
  moduleCode: string; moduleTitle: string; level: string; faculty: string; department: string;
  moduleLeader: string; academicYear: string; teachingPeriod: string; assessmentProfile: AssessmentProfile | ''; assessmentFormat: AssessmentFormat | '';
  assessmentStructure: string; assessmentPurpose: string; expectations: string; criteria: string;
  preparation: string; workedExamples: string; commonPitfalls: string; assessmentRequirements: string;
  feedbackAvailable: string; usingFeedback: string; supportRoutes: string; cohortContext: string;
  evaluatedLearning: string; performancePatterns: string; cohortStrengths: string; improvementAreas: string;
  criteriaApplication: string; improvedApproaches: string; futureUse: string; debriefSupport: string; keatsLocation: string;
};

export type HandoverStatus = 'included' | 'link' | 'na' | 'follow';
export type HandoverItem = { id: string; label: string; status: HandoverStatus; url: string };

export const formatLabels: Record<AssessmentFormat, string> = {
  in_person_exam: 'In-person or closed-book examination', open_book_exam: 'Open-book or time-limited examination',
  essay_report: 'Coursework essay or report', quant_problem_set: 'Quantitative problem set',
  econometrics_project: 'Economics, statistics or econometrics data project', case_analysis: 'Case analysis',
  presentation: 'Individual or group presentation', group_project: 'Group project', take_home: 'Take-home assessment',
};
export const profileLabels: Record<AssessmentProfile, string> = {
  exam: 'Examination-heavy module', mixed: 'Mixed-assessment module', coursework: 'Coursework-only module',
};

export const emptyData: ToolkitData = {
  moduleCode: '', moduleTitle: '', level: '', faculty: '', department: '', moduleLeader: '', academicYear: '2026/27',
  teachingPeriod: '', assessmentProfile: '', assessmentFormat: '', assessmentStructure: '', assessmentPurpose: '', expectations: '', criteria: '',
  preparation: '', workedExamples: '', commonPitfalls: '', assessmentRequirements: '', feedbackAvailable: '', usingFeedback: '',
  supportRoutes: '', cohortContext: '', evaluatedLearning: '', performancePatterns: '', cohortStrengths: '', improvementAreas: '',
  criteriaApplication: '', improvedApproaches: '', futureUse: '', debriefSupport: '', keatsLocation: '',
};

export const initialHandover: HandoverItem[] = [
  { id: 'generated', label: 'Generated guide or general feedback document', status: 'included', url: '' },
  { id: 'paper', label: 'Mock paper or approved past paper', status: 'follow', url: '' },
  { id: 'solution', label: 'Solution, model answer or model approach', status: 'follow', url: '' },
  { id: 'rubric', label: 'Current marking rubric or assessment criteria', status: 'follow', url: '' },
  { id: 'example', label: 'Annotated worked example showing strengths and improvements', status: 'follow', url: '' },
  { id: 'prior', label: 'Generic cohort feedback from a previous year', status: 'na', url: '' },
];
