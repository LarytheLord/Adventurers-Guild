// Evidence checklist for the CERT-In AI Security Auditing Guidelines, v1.0 (4 November 2026).
// Rule: every item must trace to a sentence in the PDF and carry its section number.
// Status: only sections 8.1 and 7.8 are filled in. Their wording is taken from sentences already
// quoted in content.ts. Sections 8.2 to 8.9 are left empty until each item is checked against the
// PDF itself. Do not add an item here without reading the sentence it comes from.

import { CERTIN_PDF_URL, EXPLAINER_DISCLAIMER, EXPLAINER_PATH, stripLinks } from '@/lib/cert-in-explainer/content';

export const CHECKLIST_PATH = '/guides/cert-in-ai-audit-evidence-checklist';
export const CHECKLIST_TITLE = 'CERT-In AI audit evidence checklist: what to prepare, by audit domain';
export const CHECKLIST_DESCRIPTION =
  'Plain-English evidence checklist drawn from the CERT-In AI Security Auditing Guidelines (v1.0). Every item cites its section number.';
export const CHECKLIST_PUBLISHED = '2026-11-12';
export { CERTIN_PDF_URL, EXPLAINER_DISCLAIMER, EXPLAINER_PATH };

export const CHECKLIST_INTRO =
  'Auditors under the CERT-In AI Security Auditing Guidelines work from evidence, so this page lists what to have ready for each audit domain in section 8, with the section number beside every item. It is a partial list for now: only the items we have checked against the guideline text appear here.';

export interface ChecklistItem {
  text: string;
  ref: string;
}

export interface ChecklistDomain {
  section: string;
  name: string;
  items: ChecklistItem[];
}

export const CHECKLIST_DOMAINS: ChecklistDomain[] = [
  {
    section: '8.1',
    name: 'Governance',
    items: [
      {
        text: 'A complete, current inventory of all your AI systems, with each one\'s purpose, owner, risk tier, deployment status, data sources and model type.',
        ref: '8.1, Audit Controls',
      },
      {
        text: 'Tier 1 systems: a named AI system owner and a basic AI usage policy. The impact assessment (AIIA) is voluntary at this tier.',
        ref: '8.1, risk-tier applicability table',
      },
      {
        text: 'Tier 2 systems: an established AI governance function, a simplified AIIA (mandatory at this tier) and a maintained model inventory.',
        ref: '8.1, risk-tier applicability table',
      },
    ],
  },
  { section: '8.2', name: 'Not yet covered', items: [] },
  { section: '8.3', name: 'Not yet covered', items: [] },
  { section: '8.4', name: 'Not yet covered', items: [] },
  { section: '8.5', name: 'Not yet covered', items: [] },
  { section: '8.6', name: 'Not yet covered', items: [] },
  { section: '8.7', name: 'Not yet covered', items: [] },
  { section: '8.8', name: 'Not yet covered', items: [] },
  { section: '8.9', name: 'Not yet covered', items: [] },
];

/** Documents auditors request before fieldwork. This is section 7.8, not one of the nine domains. */
export const CHECKLIST_PREFIELDWORK: ChecklistItem[] = [
  {
    text: 'Be ready to hand over the documents on the auditor\'s pre-fieldwork list. The guideline calls that list the minimum. Examples it names: AI governance policy, model cards, AI threat model, VAPT reports and API security test results.',
    ref: '7.8, Table 32',
  },
];

export interface ChecklistFaq {
  q: string;
  a: string;
}

export const CHECKLIST_FAQ: ChecklistFaq[] = [
  {
    q: 'What happens if we have no AI inventory?',
    a: 'Auditors start with your inventory. If it is missing, the guideline says "this constitutes a governance non-conformity" (7.3, Step 1).',
  },
  {
    q: 'Is this the full list of what an auditor will ask for?',
    a: 'No. The guideline calls its pre-fieldwork document list "the minimum" (7.8, Table 32). Check the official PDF before you rely on this page.',
  },
];

export const CHECKLIST_NOTE =
  'Not yet covered: sections 8.2 to 8.9. We have not read those sections of the official PDF, so no evidence items are listed for them. We add an item only after reading the sentence it comes from.';

export function checklistPlainText(): string {
  const parts: string[] = [CHECKLIST_TITLE, CHECKLIST_DESCRIPTION, CHECKLIST_INTRO, CHECKLIST_NOTE];
  for (const d of CHECKLIST_DOMAINS) {
    parts.push(`${d.section} ${d.name}`);
    for (const i of d.items) parts.push(`${i.text} (${i.ref})`);
  }
  for (const i of CHECKLIST_PREFIELDWORK) parts.push(`${i.text} (${i.ref})`);
  for (const f of CHECKLIST_FAQ) parts.push(f.q, f.a);
  parts.push(EXPLAINER_DISCLAIMER);
  return parts.map(stripLinks).join('\n');
}
