import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { ToolkitData } from './types';

const GREEN = '008A00';
const BLACK = '000000';
const MUTED = '565656';

function filenamePart(value: string) {
  return (value || 'Module').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Module';
}

function paragraphs(value: string, limit = 4) {
  return value.split(/\n+/).map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).slice(0, limit);
}

function addTitle(slide: pptxgen.Slide, first: string, second?: string) {
  slide.addText(first, { x: 0.4, y: 0.27, w: 11.75, h: 0.48, fontFace: 'Georgia', fontSize: 25, color: BLACK, margin: 0, breakLine: false });
  if (second) slide.addText(second, { x: 0.4, y: 0.78, w: 11.75, h: 0.52, fontFace: 'Georgia', fontSize: 25, color: GREEN, margin: 0 });
}

function addHeading(slide: pptxgen.Slide, text: string, x: number, y: number, w: number) {
  slide.addText(text, { x, y, w, h: 0.42, fontFace: 'Georgia', fontSize: 18, bold: true, color: GREEN, margin: 0, fit: 'shrink' });
}

function addBody(slide: pptxgen.Slide, text: string, x: number, y: number, w: number, h: number, bullet = false, maxItems = 5) {
  const items = paragraphs(text, bullet ? maxItems : 8);
  const runs = items.length ? items.map((line, index) => ({ text: line, options: { bullet: bullet ? { indent: 16 } : undefined, breakLine: index < items.length - 1 } })) : [{ text: '[Module-specific information required]', options: { italic: true, color: MUTED } }];
  slide.addText(runs, { x, y, w, h, fontFace: 'Georgia', fontSize: 15, color: BLACK, margin: 0.04, breakLine: false, valign: 'top', fit: 'shrink', paraSpaceAfter: 6 });
}

function addFooter(slide: pptxgen.Slide, number: number, moduleLabel: string) {
  slide.addText(moduleLabel, { x: 0.52, y: 6.82, w: 10.3, h: 0.16, fontFace: 'Arial', fontSize: 8, color: MUTED, margin: 0 });
  slide.addText(String(number), { x: 12.05, y: 6.81, w: 0.25, h: 0.16, fontFace: 'Arial', fontSize: 8, color: BLACK, align: 'right', margin: 0 });
}

export async function createAssessmentSlides(data: ToolkitData, graduateProfileImage?: ArrayBuffer) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'KBS_TEMPLATE', width: 12.598958880139982, height: 7.086805555555555 });
  pptx.layout = 'KBS_TEMPLATE';
  pptx.author = data.moduleLeader || 'Module team';
  pptx.subject = 'Student-facing assessment and feedback information';
  pptx.title = `${data.moduleCode} ${data.moduleTitle} assessment and feedback`;
  pptx.company = data.faculty || data.department || '';
  pptx.theme = { headFontFace: 'Georgia', bodyFontFace: 'Georgia' };
  const moduleLabel = [data.moduleCode, data.moduleTitle, data.academicYear].filter(Boolean).join(' · ');

  const slide1 = pptx.addSlide();
  slide1.background = { color: 'FFFFFF' };
  addTitle(slide1, 'How is the module assessed?', 'And how does this support your learning?');
  addHeading(slide1, 'What makes up the assessment and why is it designed this way?', 0.42, 1.72, 5.52);
  addBody(slide1, `${data.assessmentStructure}\n${data.assessmentPurpose}`, 0.42, 2.14, 5.52, 4.05, true);
  addHeading(slide1, 'What learning will you demonstrate?', 6.4, 1.72, 5.54);
  addBody(slide1, data.learningOutcomes, 6.4, 2.14, 5.54, 4.05, true);
  addFooter(slide1, 1, moduleLabel);

  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };
  addTitle(slide2, 'How is the module assessed?', 'And how does this support your learning?');
  addHeading(slide2, 'How will your work be evaluated?', 0.42, 1.72, 5.52);
  addBody(slide2, data.criteria, 0.42, 2.12, 5.52, 1.97, true);
  addHeading(slide2, 'How do we ensure expectations are clear and assessment is fair?', 0.42, 4.3, 5.52);
  addBody(slide2, data.fairnessAndClarity, 0.42, 4.74, 5.52, 1.47, false);
  addHeading(slide2, 'How will you receive feedback and how can it help you improve?', 6.4, 1.72, 5.54);
  addBody(slide2, `${data.feedbackAvailable}\nHow to use this feedback: ${data.usingFeedback}`, 6.4, 2.21, 5.54, 4.0, true, 8);
  addFooter(slide2, 2, moduleLabel);

  const slide3 = pptx.addSlide();
  slide3.background = { color: 'FFFFFF' };
  addTitle(slide3, 'How does this assessment develop your skills for the future?');
  slide3.addText('The assessment gives you opportunities to develop and demonstrate relevant skills.', { x: 0.42, y: 1.34, w: graduateProfileImage ? 6.55 : 11.72, h: 0.38, fontFace: 'Georgia', fontSize: 17, bold: true, color: GREEN, margin: 0 });
  addBody(slide3, data.skillsEmployability, 0.42, 1.83, graduateProfileImage ? 6.55 : 11.72, 4.58, true);
  if (graduateProfileImage) {
    let binary = ''; const bytes = new Uint8Array(graduateProfileImage);
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    slide3.addImage({ data: `data:image/png;base64,${btoa(binary)}`, x: 7.45, y: 1.42, w: 4.55, h: 4.72, transparency: 0 });
  }
  addFooter(slide3, 3, moduleLabel);

  const output = await pptx.write({ outputType: 'blob' }) as Blob;
  const zip = await JSZip.loadAsync(await output.arrayBuffer());
  const contentTypes = zip.file('[Content_Types].xml');
  if (contentTypes) {
    const xml = await contentTypes.async('string');
    zip.file('[Content_Types].xml', xml.replace(/<Override PartName="\/ppt\/slideMasters\/slideMaster[23]\.xml"[^>]*\/>/g, ''));
  }
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  return { blob, filename: `${filenamePart(data.moduleCode || data.moduleTitle)}_Assessment_and_Feedback_Slides_Pilot.pptx` };
}
