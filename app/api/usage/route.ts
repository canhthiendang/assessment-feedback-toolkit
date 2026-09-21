import { NextResponse } from 'next/server';
import { getUsageDb } from '../../../db';
const allowed = {
  stage: new Set(['before','after']), workflow: new Set(['manual','ai']), assessmentProfile: new Set(['exam','mixed','coursework']),
  outputType: new Set(['guide','slides_pilot','general_feedback']),
  assessmentFormat: new Set(['in_person_exam','open_book_exam','essay_report','quant_problem_set','econometrics_project','case_analysis','presentation','group_project','take_home']),
};
function text(value: unknown, max = 120) { return typeof value === 'string' ? value.trim().slice(0,max) : ''; }
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; if (body.consent !== true) return NextResponse.json({ error:'Explicit consent is required.' }, { status:400 }); const stage = text(body.stage,20); const workflow = text(body.workflow,20); const profile = text(body.assessmentProfile,30); const format = text(body.assessmentFormat,50); const outputType = text(body.outputType,30);
    if (!allowed.stage.has(stage) || !allowed.workflow.has(workflow) || !allowed.assessmentProfile.has(profile) || !allowed.assessmentFormat.has(format) || !allowed.outputType.has(outputType)) return NextResponse.json({ error:'Invalid aggregate fields.' }, { status:400 });
    const db = getUsageDb(); const now = new Date().toISOString();
    await db.batch([
      db.prepare("DELETE FROM usage_events WHERE created_at < datetime('now','-24 months')"),
      db.prepare('INSERT INTO usage_events (id, institution, faculty, department, module_level, output_type, stage, workflow, assessment_profile, assessment_format, academic_period, created_at, month) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), text(body.institution) || 'Not supplied', text(body.faculty) || 'Not supplied', text(body.department) || 'Not supplied', text(body.moduleLevel,30) || 'Not supplied', outputType, stage, workflow, profile, format, text(body.academicPeriod,30) || 'Not supplied', now, now.slice(0,7)),
    ]);
    return NextResponse.json({ recorded:true });
  } catch { return NextResponse.json({ error:'Usage event was not recorded.' }, { status:500 }); }
}
