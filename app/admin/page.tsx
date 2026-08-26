import { chatGPTSignOutPath, requireChatGPTUser } from '../chatgpt-auth';
import UsageDashboard from './usage-dashboard';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin'); const owner = Boolean(process.env.ADMIN_CHATGPT_USER_ID && user.userId === process.env.ADMIN_CHATGPT_USER_ID);
  return <main className="admin-shell"><header className="admin-header"><div><p className="section-label">Private reporting</p><h1>Toolkit usage</h1><p>Signed in as {user.displayName}</p></div><a href={chatGPTSignOutPath('/')} className="secondary-button">Sign out</a></header>{owner ? <UsageDashboard /> : <section className="error-summary" role="alert"><h2>Owner access only</h2><p>This reporting view is restricted to Dr Canh Thien Dang’s authorised ChatGPT account. No usage data is shown.</p><Link href="/">Return to the toolkit</Link></section>}</main>;
}
