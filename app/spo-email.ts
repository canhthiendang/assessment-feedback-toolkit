import type { HandoverItem, ToolkitData } from './types';

function materialStatus(item: HandoverItem) {
  if (item.status === 'included') return 'Included';
  if (item.status === 'link') return item.url.trim() ? `Link provided: ${item.url.trim()}` : 'Link to be added';
  return 'To follow';
}

export function createSpoEmail(data: ToolkitData, handover: HandoverItem[], spoEmail: string, ccEmail = '') {
  const moduleCode = data.moduleCode.trim();
  const moduleTitle = data.moduleTitle.trim();
  const moduleLeader = data.moduleLeader.trim();
  const moduleLabel = `${moduleCode} — ${moduleTitle}`;
  const materials = handover
    .filter((item) => item.status !== 'na')
    .map((item) => `- ${item.label}: ${materialStatus(item)}`)
    .join('\n');

  const subject = `${moduleCode} ${moduleTitle} — assessment and feedback materials for KEATS`;
  const body = `Dear SPO team,

I hope you are well.

I am writing to share the assessment and feedback materials for ${moduleLabel}. Please could you upload or link the approved items below on the relevant KEATS or programme page so that students can find them easily?

Materials for ${moduleLabel}:
${materials}

I will attach the downloaded document and any files marked “Included” before sending this email. Items marked “To follow” will be shared when they are ready.

Please let me know if another location would be more appropriate, and could you confirm the page location once the materials are available?

Thank you very much for your support.

Best wishes,
${moduleLeader}`;

  const query = [`subject=${encodeURIComponent(subject)}`, `body=${encodeURIComponent(body)}`];
  if (ccEmail.trim()) query.push(`cc=${encodeURIComponent(ccEmail.trim())}`);

  return { subject, body, href: `mailto:${encodeURIComponent(spoEmail.trim())}?${query.join('&')}` };
}
