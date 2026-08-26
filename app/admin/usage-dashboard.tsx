'use client';
import { useEffect, useState } from 'react';
type Row = { month:string; academicPeriod:string; faculty:string; department:string; stage:string; workflow:string; assessmentProfile:string; assessmentFormat:string; events:number; suppressed:boolean; displayEvents:string };
export default function UsageDashboard() {
  const [rows,setRows] = useState<Row[]>([]); const [status,setStatus] = useState('Loading aggregate events…');
  useEffect(() => { fetch('/api/admin/usage').then(async response => { const body = await response.json() as { error?:string; rows?:Row[]; note?:string }; if (!response.ok) throw new Error(body.error || 'Could not load report.'); setRows(body.rows || []); setStatus(body.note || ''); }).catch(error => setStatus(error.message)); }, []);
  function downloadCsv() {
    const headings = ['month','academic period','faculty','department','document type','route','assessment profile','assessment format','events'];
    const escape = (value:string|number) => `"${String(value).replaceAll('"','""')}"`;
    const csv = [headings.map(escape).join(','), ...rows.map(row => [row.month,row.academicPeriod,row.faculty,row.department,row.stage,row.workflow,row.assessmentProfile,row.assessmentFormat,row.displayEvents].map(escape).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href=url; anchor.download='assessment-feedback-toolkit-aggregate-usage.csv'; anchor.click(); URL.revokeObjectURL(url);
  }
  return <section className="admin-card"><div className="admin-actions"><div><h2>Monthly aggregate generation events</h2><p>{status}</p></div><button type="button" className="secondary-button" onClick={downloadCsv} disabled={!rows.length}>Download aggregate CSV</button></div><div className="table-scroll"><table><caption>Usage events retained for up to 24 months. Small cells are shown as less than five.</caption><thead><tr><th>Month</th><th>Period</th><th>Faculty</th><th>Department</th><th>Document</th><th>Route</th><th>Profile</th><th>Format</th><th>Events</th></tr></thead><tbody>{rows.length ? rows.map((row,index) => <tr key={`${row.month}-${row.department}-${index}`}><td>{row.month}</td><td>{row.academicPeriod}</td><td>{row.faculty}</td><td>{row.department}</td><td>{row.stage === 'before' ? 'Before' : 'After'}</td><td>{row.workflow}</td><td>{row.assessmentProfile}</td><td>{row.assessmentFormat}</td><td>{row.displayEvents}</td></tr>) : <tr><td colSpan={9}>No reportable events yet.</td></tr>}</tbody></table></div><p className="field-help">This view contains no names, emails, module identifiers, form content, documents, ChatGPT content, student data or persistent visitor identifiers.</p></section>;
}
