import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from 'docx';
import { DocumentBrand, DocumentStage, ToolkitData, formatLabels, profileLabels } from './types';

const KCL_RED = 'A6192E';
const GENERIC_NAVY = '17365D';
const INK = '1E293B';
const MUTED = '536171';
const BORDER = 'CED6E0';
function clean(value: string) { return value.trim() || 'Not specified'; }
function filenamePart(value: string) { return value.trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'Module'; }
function richRuns(text: string) {
  const match = text.match(/^([^:]{2,60}:)\s*(.*)$/);
  return match ? [new TextRun({ text: `${match[1]} `, bold: true, color: INK }), new TextRun({ text: match[2], color: INK })] : [new TextRun({ text, color: INK })];
}
function structuredLines(value: string) {
  const normalized = clean(value).replace(/\\n/g, '\n');
  if (normalized.includes('\n')) return normalized.split(/\r?\n/);
  const list = normalized.match(/^(.{8,180}\b(?:include|includes|following)\b[^:]*:)\s*(.+)$/i);
  if (list) {
    const items = list[2].split(/;\s+/).map(item => item.trim()).filter(Boolean);
    if (items.length >= 3) return [list[1], '', ...items.map(item => `• ${item.replace(/^and\s+/i, '')}`)];
  }
  if (normalized.length < 420) return [normalized];
  const sentences = normalized.match(/[^.!?]+(?:[.!?]+|$)/g)?.map(sentence => sentence.trim()).filter(Boolean) || [normalized];
  const paragraphs: string[] = []; let current = '';
  for (const sentence of sentences) {
    if (current && `${current} ${sentence}`.length > 380) { paragraphs.push(current); current = sentence; }
    else current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) paragraphs.push(current);
  return paragraphs.flatMap((paragraph, index) => index ? ['', paragraph] : [paragraph]);
}
function formatted(label: string, value: string) {
  const lines = structuredLines(value); const output: Paragraph[] = [new Paragraph({ spacing: { before: 70, after: 70 }, keepNext: true, children: [new TextRun({ text: label, bold: true, color: INK })] })];
  let afterBlank = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { afterBlank = true; continue; }
    const bullet = line.match(/^[•*-]\s+(.+)$/); const numbered = line.match(/^(\d+[.)])\s+(.+)$/);
    if (bullet) output.push(new Paragraph({ bullet: { level: 0 }, spacing: { before: afterBlank ? 100 : 0, after: 55 }, children: richRuns(bullet[1]) }));
    else if (numbered) output.push(new Paragraph({ indent: { left: 360, hanging: 280 }, spacing: { before: afterBlank ? 100 : 0, after: 55 }, children: [new TextRun({ text: `${numbered[1]} `, bold: true, color: INK }), ...richRuns(numbered[2])] }));
    else output.push(new Paragraph({ spacing: { before: afterBlank ? 120 : 0, after: 90 }, children: richRuns(line) }));
    afterBlank = false;
  }
  return output;
}
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
  const profileText = data.assessmentProfile === 'custom' ? data.customAssessmentProfile : data.assessmentProfile ? profileLabels[data.assessmentProfile] : '';
  const formatText = data.assessmentFormat === 'custom' ? data.customAssessmentFormat : data.assessmentFormat ? formatLabels[data.assessmentFormat] : '';
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    left: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: BORDER }, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  };
  const headingChildren: (TextRun | ImageRun)[] = brand === 'kcl' && logo
    ? [new ImageRun({ data: new Uint8Array(logo), type: 'png', transformation: { width: 130, height: 100 }, altText: { title: "King's College London logo", description: "King's College London", name: 'KCL logo' } })]
    : [new TextRun({ text: 'ASSESSMENT & FEEDBACK TOOLKIT', bold: true, color: accent, size: 18, characterSpacing: 45 })];
  const content = stage === 'before' ? [
    sectionHeading(1, 'Assessment overview', accent), ...formatted('Assessment structure and weighting', data.assessmentStructure), ...formatted('Why this assessment is used', data.assessmentPurpose), ...formatted('Requirements and permitted resources', data.assessmentRequirements),
    sectionHeading(2, 'Expectations and criteria', accent), ...formatted('What students should demonstrate', data.expectations), ...formatted('How the criteria will be applied', data.criteria),
    sectionHeading(3, 'Preparation and readiness', accent), ...formatted('Learning outcomes addressed', data.learningOutcomes), ...formatted('How to prepare', data.preparation), ...formatted('Learning-outcome-linked worked example or practice opportunity', data.workedExamples), ...formatted('Common pitfalls and how to avoid them', data.commonPitfalls),
    sectionHeading(4, 'Feedback and improvement', accent), ...formatted('Feedback available', data.feedbackAvailable), ...formatted('How to use feedback', data.usingFeedback), ...formatted('Support and debrief routes', data.supportRoutes),
  ] : [
    sectionHeading(1, 'Assessment and cohort context', accent), ...formatted('Context', data.cohortContext),
    sectionHeading(2, 'What the assessment evaluated', accent), ...formatted('Learning outcomes addressed', data.learningOutcomes), ...formatted('Knowledge, skills and judgement', data.evaluatedLearning),
    sectionHeading(3, 'Overall performance patterns', accent), ...formatted('Aggregate, non-identifiable patterns', data.performancePatterns),
    sectionHeading(4, 'What the cohort did well', accent), ...formatted('Common strengths', data.cohortStrengths),
    sectionHeading(5, 'Common areas for improvement', accent), ...formatted('Priorities for improvement', data.improvementAreas),
    sectionHeading(6, 'How the criteria were applied', accent), ...formatted('Application of the rubric or criteria', data.criteriaApplication),
    sectionHeading(7, 'Illustrative improved approaches', accent), ...formatted('Examples of stronger reasoning or execution', data.improvedApproaches),
    sectionHeading(8, 'Using this feedback in future', accent), ...formatted('Transfer to later learning or assessment', data.futureUse),
    sectionHeading(9, 'Further support and debrief', accent), ...formatted('Support, resources and arrangements', data.debriefSupport),
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
          metadataRow('Module', `${data.moduleCode} ${data.moduleTitle}`.trim(), accent, tint), metadataRow('Assessment profile', profileText, accent, tint), metadataRow('Assessment format', formatText, accent, tint),
          metadataRow('Level and period', [data.level, data.teachingPeriod, data.academicYear].filter(Boolean).join(' | '), accent, tint), metadataRow('Module leader', data.moduleLeader, accent, tint), metadataRow('Department / faculty', [data.department, data.faculty].filter(Boolean).join(' | '), accent, tint),
        ] }), ...content,
        sectionHeading(stage === 'before' ? 5 : 10, 'Where to find materials', accent), ...formatted('KEATS or programme-page location', data.keatsLocation),
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
    sectionHeading(1, 'Assessment structure and rationale', accent), ...formatted('What makes up the assessment', data.assessmentStructure), ...formatted('Why this design supports learning', data.assessmentPurpose),
    sectionHeading(2, 'Learning outcomes', accent), ...formatted('What students will demonstrate', data.learningOutcomes),
    sectionHeading(3, 'Evaluation and fairness', accent), ...formatted('How work will be evaluated', data.criteria), ...formatted('How expectations and fairness are supported', data.fairnessAndClarity),
    sectionHeading(4, 'Preparation and common pitfalls', accent), ...formatted('How to prepare', data.preparation), ...formatted('Common pitfalls', data.commonPitfalls), ...formatted('Practice and worked examples', data.workedExamples),
    sectionHeading(5, 'Feedback and improvement', accent), ...formatted('Feedback opportunities', data.feedbackAvailable), ...formatted('How to use feedback', data.usingFeedback), ...formatted('Support routes', data.supportRoutes),
    sectionHeading(6, 'Skills and employability', accent), ...formatted('Skills developed through this assessment', data.skillsEmployability),
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
