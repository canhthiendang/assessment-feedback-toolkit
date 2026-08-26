import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageOrientation,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export type AssessmentType = 'exam' | 'mixed' | 'coursework';

export type GuideData = {
  assessmentType: AssessmentType | '';
  moduleCode: string;
  moduleTitle: string;
  level: string;
  department: string;
  moduleLeader: string;
  academicYear: string;
  teachingPeriod: string;
  syllabusName: string;
  sourceNotes: string;
  assessmentStructure: string;
  assessmentPurpose: string;
  expectations: string;
  criteria: string;
  preparation: string;
  workedExamples: string;
  commonPitfalls: string;
  feedbackAvailable: string;
  usingFeedback: string;
  supportRoutes: string;
  keatsLink: string;
  examFormat: string;
  examCoverage: string;
  examConditions: string;
  mixedRelationship: string;
  mixedSequence: string;
  courseworkMilestones: string;
  courseworkSubmission: string;
};

export const assessmentLabels: Record<AssessmentType, string> = {
  exam: 'Examination-heavy module',
  mixed: 'Mixed-assessment module',
  coursework: 'Coursework-only module',
};

const navy = '1F3864';
const lightBlue = 'E8EEF5';
const grey = 'D5DCE5';

function safe(value: string) {
  return value.trim() || 'Not specified';
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text })],
  });
}

function labelled(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 110 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: '172033' }),
      new TextRun({ text: safe(value), color: '25324A' }),
    ],
  });
}

function metadataRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 2700, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: lightBlue },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: navy })] })],
      }),
      new TableCell({
        width: { size: 6660, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun(safe(value))] })],
      }),
    ],
  });
}

function filenamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60) || 'Module';
}

export async function createGuideDocument(data: GuideData) {
  const profile = data.assessmentType ? assessmentLabels[data.assessmentType] : 'Assessment profile not selected';
  const profileSpecific: Paragraph[] = [];

  if (data.assessmentType === 'exam') {
    profileSpecific.push(
      labelled('Examination format and duration', data.examFormat),
      labelled('Coverage and relationship to teaching', data.examCoverage),
      labelled('Conditions and permitted materials', data.examConditions),
    );
  }

  if (data.assessmentType === 'mixed') {
    profileSpecific.push(
      labelled('Relationship between assessment components', data.mixedRelationship),
      labelled('Sequencing and how learning carries forward', data.mixedSequence),
    );
  }

  if (data.assessmentType === 'coursework') {
    profileSpecific.push(
      labelled('Milestones and formative opportunities', data.courseworkMilestones),
      labelled('Submission requirements', data.courseworkSubmission),
    );
  }

  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: grey },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: grey },
    left: { style: BorderStyle.SINGLE, size: 4, color: grey },
    right: { style: BorderStyle.SINGLE, size: 4, color: grey },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: grey },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: grey },
  };

  const document = new Document({
    creator: 'KBS Module Assessment and Feedback Guide Generator',
    title: `${data.moduleCode} ${data.moduleTitle} - Assessment and Feedback Guide`,
    description: 'Programme-level standardised module assessment and feedback guide',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '172033' },
          paragraph: { spacing: { line: 300, after: 120 } },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Calibri', size: 26, bold: true, color: '2E74B5' },
          paragraph: { spacing: { before: 280, after: 140 }, keepNext: true },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'KBS Module Assessment and Feedback Guide  |  ', font: 'Calibri', color: '68758A', size: 17 }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', color: '68758A', size: 17 }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: "KING'S BUSINESS SCHOOL", font: 'Calibri', bold: true, color: navy, size: 18, characterSpacing: 60 })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Module Assessment and Feedback Guide', font: 'Calibri', bold: true, color: navy, size: 44 })],
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [new TextRun({ text: 'Clear expectations, preparation and feedback routes', font: 'Calibri', color: '68758A', size: 22 })],
        }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          indent: { size: 120, type: WidthType.DXA },
          columnWidths: [2700, 6660],
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          layout: TableLayoutType.FIXED,
          borders: tableBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              cantSplit: true,
              children: [
                new TableCell({
                  columnSpan: 2,
                  shading: { type: ShadingType.CLEAR, fill: navy },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: 'Module information', bold: true, color: 'FFFFFF' })],
                    }),
                  ],
                }),
              ],
            }),
            metadataRow('Module', `${data.moduleCode} ${data.moduleTitle}`.trim()),
            metadataRow('Assessment profile', profile),
            metadataRow('Level and teaching period', [data.level, data.teachingPeriod, data.academicYear].filter(Boolean).join(' | ')),
            metadataRow('Module leader', data.moduleLeader),
            metadataRow('Department', data.department),
          ],
        }),
        heading('1. Assessment overview'),
        labelled('Assessment structure and weighting', data.assessmentStructure),
        labelled('Purpose of the assessment', data.assessmentPurpose),
        ...profileSpecific,
        heading('2. Expectations and criteria'),
        labelled('What students are expected to demonstrate', data.expectations),
        labelled('How the marking criteria will be applied', data.criteria),
        heading('3. Preparation and assessment readiness'),
        labelled('How students should prepare', data.preparation),
        labelled('Worked examples, practice and readiness support', data.workedExamples),
        labelled('Common pitfalls', data.commonPitfalls),
        heading('4. Feedback and improvement'),
        labelled('Feedback students will receive', data.feedbackAvailable),
        labelled('How students should use feedback in future work', data.usingFeedback),
        heading('5. Support and further information'),
        labelled('Support and contact routes', data.supportRoutes),
        labelled('KEATS or module link', data.keatsLink),
        ...(data.sourceNotes.trim() ? [labelled('Additional module information', data.sourceNotes)] : []),
        ...(data.syllabusName ? [labelled('Source document consulted by module leader', data.syllabusName)] : []),
        new Paragraph({
          spacing: { before: 260 },
          children: [new TextRun({ text: 'Accuracy confirmation', bold: true, color: navy })],
        }),
        new Paragraph({
          children: [new TextRun({ text: `Reviewed by ${safe(data.moduleLeader)} on ${new Date().toLocaleDateString('en-GB')}.`, italics: true, color: '68758A' })],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(document);
  const filename = `${filenamePart(data.moduleCode)}_${filenamePart(data.moduleTitle)}_Assessment_and_Feedback_Guide.docx`;
  return { blob, filename };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
