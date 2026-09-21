import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from 'docx';
import { DocumentBrand, DocumentStage, ToolkitData, formatLabels, profileLabels } from './types';

const KCL_RED = 'A6192E';
const GENERIC_NAVY = '17365D';
const INK = '1E293B';
const MUTED = '536171';
const BORDER = 'CED6E0';
function clean(value: string) { return value.trim() || 'Not specified'; }
function filenamePart(value: string) { return value.trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'Module'; }
function labelled(label: string, value: string) { return new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: `${label}: `, bold: true, color: INK }), new TextRun({ text: clean(value), color: INK })] }); }
function sectionHeading(number: number, text: string, accent: string) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, keepNext: true, children: [new TextRun({ text: `${number}. ${text}`, bold: true, color: accent })] }); }
function metadataRow(label: string, value: string, accent: string, tint: string) {
  return new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: 2700, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: tint }, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: accent })] })] }),
    new TableCell({ width: { size: 6660, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: clean(value), color: INK })] })] }),
  ] });
}

export async function createToolkitDocument(data: ToolkitData, stage: DocumentStage, brand: DocumentBrand, logo?: ArrayBuffer) {
  const accent = brand === 'kcl' ? KCL_RED : GENERIC_NAVY;
  const tint = brand === 'kcl' ? 'F8E9EC' : 'EAF0F7';
  const title = stage === 'before' ? 'Assessment and Feedback Guide' : 'General Feedback';
  const subtitle = stage === 'before' ? 'Expectations, preparation and feedback routes' : 'Cohort-level themes and practical next steps';
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    left: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  };
  const headingChildren: (TextRun | ImageRun)[] = brand === 'kcl' && logo
    ? [new ImageRun({ data: new Uint8Array(logo), type: 'png', transformation: { width: 130, height: 100 }, altText: { title: "King's College London logo", description: "King's College London", name: 'KCL logo' } })]
    : [new TextRun({ text: 'ASSESSMENT & FEEDBACK TOOLKIT', bold: true, color: accent, size: 18, characterSpacing: 45 })];
  const content = stage === 'before' ? [
    sectionHeading(1, 'Assessment overview', accent), labelled('Assessment structure and weighting', data.assessmentStructure), labelled('Why this assessment is used', data.assessmentPurpose), labelled('Requirements and permitted resources', data.assessmentRequirements),
    sectionHeading(2, 'Expectations and criteria', accent), labelled('What students should demonstrate', data.expectations), labelled('How the criteria will be applied', data.criteria),
    sectionHeading(3, 'Preparation and readiness', accent), labelled('How to prepare', data.preparation), labelled('Worked examples or practice opportunities', data.workedExamples), labelled('Common pitfalls and how to avoid them', data.commonPitfalls),
    sectionHeading(4, 'Feedback and improvement', accent), labelled('Feedback available', data.feedbackAvailable), labelled('How to use feedback', data.usingFeedback), labelled('Support and debrief routes', data.supportRoutes),
  ] : [
    sectionHeading(1, 'Assessment and cohort context', accent), labelled('Context', data.cohortContext),
    sectionHeading(2, 'What the assessment evaluated', accent), labelled('Knowledge, skills and judgement', data.evaluatedLearning),
    sectionHeading(3, 'Overall performance patterns', accent), labelled('Aggregate, non-identifiable patterns', data.performancePatterns),
    sectionHeading(4, 'What the cohort did well', accent), labelled('Common strengths', data.cohortStrengths),
    sectionHeading(5, 'Common areas for improvement', accent), labelled('Priorities for improvement', data.improvementAreas),
    sectionHeading(6, 'How the criteria were applied', accent), labelled('Application of the rubric or criteria', data.criteriaApplication),
    sectionHeading(7, 'Illustrative improved approaches', accent), labelled('Examples of stronger reasoning or execution', data.improvedApproaches),
    sectionHeading(8, 'Using this feedback in future', accent), labelled('Transfer to later learning or assessment', data.futureUse),
    sectionHeading(9, 'Further support and debrief', accent), labelled('Support, resources and arrangements', data.debriefSupport),
  ];
  const doc = new Document({
    creator: 'Dr Canh Thien Dang', title: `${data.moduleCode} ${data.moduleTitle} - ${title}`,
    description: stage === 'before' ? 'Editable student-facing assessment and feedback guide' : 'Editable cohort-level general feedback document',
    styles: {
      default: {
        document: {
          run: { font: 'Aptos', size: 22, color: INK },
          paragraph: { spacing: { line: 300, after: 120 } },
        },
      },
      paragraphStyles: [{
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Aptos Display', size: 27, bold: true, color: accent },
        paragraph: { spacing: { before: 300, after: 120 }, keepNext: true },
      }],
    },
    sections: [{ properties: { page: { margin: { top: 1040, right: 1200, bottom: 1040, left: 1200, header: 600, footer: 600 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${title}  |  `, color: MUTED, size: 17 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 17 })] })] }) },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: headingChildren }),
        new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, color: accent, size: 42 })] }),
        new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: subtitle, color: MUTED, size: 22 })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2700, 6660], layout: TableLayoutType.FIXED, borders: tableBorders, rows: [
          new TableRow({ tableHeader: true, cantSplit: true, children: [new TableCell({ columnSpan: 2, shading: { type: ShadingType.CLEAR, fill: accent }, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Module information', bold: true, color: 'FFFFFF' })] })] })] }),
          metadataRow('Module', `${data.moduleCode} ${data.moduleTitle}`.trim(), accent, tint), metadataRow('Assessment profile', data.assessmentProfile ? profileLabels[data.assessmentProfile] : '', accent, tint), metadataRow('Assessment format', data.assessmentFormat ? formatLabels[data.assessmentFormat] : '', accent, tint),
          metadataRow('Level and period', [data.level, data.teachingPeriod, data.academicYear].filter(Boolean).join(' | '), accent, tint), metadataRow('Module leader', data.moduleLeader, accent, tint), metadataRow('Department / faculty', [data.department, data.faculty].filter(Boolean).join(' | '), accent, tint),
        ] }), ...content,
        sectionHeading(stage === 'before' ? 5 : 10, 'Where to find materials', accent), labelled('KEATS or programme-page location', data.keatsLocation),
        new Paragraph({ spacing: { before: 280 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: accent } }, children: [
          new TextRun({ text: stage === 'after' ? 'This cohort-level summary complements individual feedback. ' : '', bold: true, color: accent }),
          new TextRun({ text: 'This editable document should be checked by the module leader against current module and institutional requirements before publication.', color: MUTED, italics: true }),
        ] }),
      ] }],
  });
  return { blob: await Packer.toBlob(doc), filename: `${filenamePart(data.moduleCode || data.moduleTitle)}_${stage === 'before' ? 'Assessment_and_Feedback_Guide' : 'General_Feedback'}_${brand === 'kcl' ? 'KCL' : 'Generic'}.docx` };
}

export async function createSlidesCompanionDocument(data: ToolkitData, brand: DocumentBrand, logo?: ArrayBuffer) {
  const accent = brand === 'kcl' ? KCL_RED : GENERIC_NAVY;
  const content = [
    sectionHeading(1, 'Assessment structure and rationale', accent), labelled('What makes up the assessment', data.assessmentStructure), labelled('Why this design supports learning', data.assessmentPurpose),
    sectionHeading(2, 'Learning outcomes', accent), labelled('What students will demonstrate', data.learningOutcomes),
    sectionHeading(3, 'Evaluation and fairness', accent), labelled('How work will be evaluated', data.criteria), labelled('How expectations and fairness are supported', data.fairnessAndClarity),
    sectionHeading(4, 'Preparation and common pitfalls', accent), labelled('How to prepare', data.preparation), labelled('Common pitfalls', data.commonPitfalls), labelled('Practice and worked examples', data.workedExamples),
    sectionHeading(5, 'Feedback and improvement', accent), labelled('Feedback opportunities', data.feedbackAvailable), labelled('How to use feedback', data.usingFeedback), labelled('Support routes', data.supportRoutes),
    sectionHeading(6, 'Skills and employability', accent), labelled('Skills developed through this assessment', data.skillsEmployability),
  ];
  const doc = new Document({
    creator: data.moduleLeader || 'Module team', title: `${data.moduleCode} ${data.moduleTitle} Assessment and Feedback Companion`,
    description: 'Accessible narrative companion to the Assessment and Feedback Slides pilot',
    styles: { default: { document: { run: { font: 'Arial', size: 22, color: INK }, paragraph: { spacing: { after: 130, line: 276 } } } } },
    sections: [{ properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Editable companion document · ', color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED })] })] }) }, children: [
      brand === 'kcl' && logo ? new Paragraph({ children: [new ImageRun({ data: new Uint8Array(logo), type: 'png', transformation: { width: 104, height: 80 }, altText: { title: "King's College London logo", description: "King's College London", name: 'KCL logo' } })] }) : new Paragraph({ children: [new TextRun({ text: 'ASSESSMENT & FEEDBACK TOOLKIT', bold: true, color: accent, size: 18, characterSpacing: 45 })] }),
      new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 120 }, children: [new TextRun({ text: 'Assessment and Feedback Companion', color: accent, bold: true, size: 38 })] }),
      new Paragraph({ spacing: { after: 250 }, children: [new TextRun({ text: [data.moduleCode, data.moduleTitle, data.academicYear].filter(Boolean).join(' · '), bold: true, size: 24 })] }),
      ...content,
      new Paragraph({ spacing: { before: 260 }, children: [new TextRun({ text: 'Module leader review required. ', bold: true, color: accent }), new TextRun({ text: 'This companion expands the slide content for accessible reference. Check it against current approved module and assessment information before release.', italics: true, color: MUTED })] }),
    ] }],
  });
  return { blob: await Packer.toBlob(doc), filename: `${filenamePart(data.moduleCode || data.moduleTitle)}_Assessment_and_Feedback_Companion_${brand === 'kcl' ? 'KCL' : 'Generic'}.docx` };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
