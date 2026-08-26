import { NextResponse } from 'next/server';
import { getChatGPTUser } from '../../../chatgpt-auth';
import { getUsageDb } from '../../../../db';
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error:'Sign in required.' }, { status:401 });
  if (!process.env.ADMIN_CHATGPT_USER_ID || user.userId !== process.env.ADMIN_CHATGPT_USER_ID) return NextResponse.json({ error:'Owner access only.' }, { status:403 });
  try {
    const db = getUsageDb();
    await db.prepare("DELETE FROM usage_events WHERE created_at < datetime('now','-24 months')").run();
    const result = await db.prepare(`SELECT month, academic_period AS academicPeriod, faculty, department, stage, workflow, assessment_profile AS assessmentProfile, assessment_format AS assessmentFormat, COUNT(*) AS events FROM usage_events GROUP BY month, academic_period, faculty, department, stage, workflow, assessment_profile, assessment_format ORDER BY month DESC, faculty, department`).all();
    const rows = (result.results || []).map((row: Record<string, unknown>) => ({ ...row, events: Number(row.events), suppressed: Number(row.events) < 5, displayEvents: Number(row.events) < 5 ? '<5' : String(row.events) }));
    return NextResponse.json({ rows, note:'Counts are document-generation events, not unique colleagues. Cells below five are suppressed.', retention:'24 months' });
  } catch { return NextResponse.json({ error:'The aggregate report could not be loaded.' }, { status:500 }); }
}
