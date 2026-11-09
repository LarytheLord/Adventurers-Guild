// Source of truth: CERT-In, "Artificial Intelligence (AI) Security Auditing Guidelines",
// Version 1.0, dated 04 November 2026. Every factual statement cites the guideline section.
// The guideline numbers two tables "Table 11": the factor table (5.3) and the composite
// score table (5.4). Quotes are copied exactly, with curly quotes and dashes written as ASCII.
// Inline links use the form [label](href).

export const CERTIN_PDF_URL = 'https://www.cert-in.org.in/PDF/AI_Security_Auditing_Guidelines.pdf';
export const EXPLAINER_PATH = '/guides/cert-in-ai-security-auditing-guidelines';
export const EXPLAINER_TITLE = 'CERT-In AI Security Auditing Guidelines (2026), explained for startups';
export const EXPLAINER_DESCRIPTION =
  'For Indian startup founders and CTOs: who the CERT-In AI Security Auditing Guidelines (v1.0, 4 November 2026) apply to, how the four risk tiers work, and a 30-day preparation plan.';
export const EXPLAINER_DISCLAIMER =
  'Guild is not a CERT-In empanelled auditor. This guide is unofficial and is not legal advice.';
export const EXPLAINER_MAILTO = 'mailto:abid@guilds.work?subject=AI%20audit%20readiness';
export const EXPLAINER_PUBLISHED = '2026-11-09';

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'quote'; text: string; cite: string }
  | { kind: 'table'; head: string[]; rows: string[][] };

export interface ExplainerSection {
  id: string;
  heading: string;
  blocks: Block[];
}

export const EXPLAINER_SUMMARY: string[] = [
  'CERT-In published Version 1.0 on 04 November 2026 (cover page). It applies to "all types and sizes of organisations" operating AI in India (4.4), including teams that call a third-party model API (4.6).',
  'Each AI system gets a tier from 1 to 4 from eight scored factors (5.3, 5.4). Tier 1 is self-assessment; Tier 2 and above need an independent audit by a CERT-In empanelled auditor (5.4).',
  'It states no effective date and no penalty, so enforcement is unclear. Read the [official PDF](' +
    CERTIN_PDF_URL +
    ') before you act on any summary, including this one.',
];

export const EXPLAINER_SECTIONS: ExplainerSection[] = [
  {
    id: 'what-was-published',
    heading: 'What was published and when',
    blocks: [
      {
        kind: 'p',
        text: 'The document is titled "Artificial Intelligence (AI) Security Auditing Guidelines", Version 1.0, dated 04 November 2026 (cover page). It runs to 107 pages (page footers).',
      },
      {
        kind: 'p',
        text: 'It sets out "a common, risk-based and lifecycle-oriented framework for assessing the governance, security, privacy, fairness, transparency, resilience and auditability of AI systems" (1). "The assigned risk tier shall determine the applicable audit domains, depth of assessment, evidence requirements, audit frequency and level of auditor independence" (4.10).',
      },
    ],
  },
  {
    id: 'who-it-applies-to',
    heading: 'Who it applies to',
    blocks: [
      {
        kind: 'quote',
        text: 'This framework applies universally to all types and sizes of organisations operating AI systems within India or processing Indian citizens\' data',
        cite: '4.4',
      },
      {
        kind: 'ul',
        items: [
          'MSMEs: obligations "are proportionate to the risk tier of their AI deployments, with simplified audit pathways available for low-risk systems" (4.4, Table 5).',
          'Startups and innovation labs: "Entities developing, piloting, or commercialising AI products and services" (4.4, Table 5).',
          'AI service providers are "Subject to audit obligations both as providers and as third-party vendors to their customers" (4.4, Table 5).',
        ],
      },
      {
        kind: 'p',
        text: 'Using someone else\'s model does not take you out of scope. "AI systems shall remain within audit scope regardless of model origin, ownership or delivery mechanism" (4.6), and the model sources listed include third-party proprietary models, open-weight models and AI-as-a-Service API models (4.6, Table 7). Agentic AI and LLM-based chatbots are named system types (4.5).',
      },
    ],
  },
  {
    id: 'out-of-scope',
    heading: 'What is out of scope',
    blocks: [
      {
        kind: 'p',
        text: 'Section 4.9 lists three exclusions, each with a catch.',
      },
      {
        kind: 'ul',
        items: [
          'Research AI used "exclusively for academic research", not in production or public-facing use, is "outside the mandatory compliance scope". Catch: "Once a research AI system transitions to pilot deployment or production, it enters full scope" (4.9).',
          'Purely rule-based automation with no "statistical learning" is "not AI systems under this framework". Catch: "hybrid systems that combine rule-based logic with ML components are fully within scope" (4.9).',
          'Consumer personal-use AI is not covered. Catch: "the providers of such AI tools operating in India remain within scope as AI service providers" (4.9).',
        ],
      },
    ],
  },
  {
    id: 'how-tiering-works',
    heading: 'How tiering works',
    blocks: [
      {
        kind: 'p',
        text: 'Each AI system "shall first be assessed against the eight inherent-risk factors below, without taking credit for claimed control effectiveness" (5.3). The eight factors are F1 Impact Severity, F2 Autonomy and Actionability, F3 Data Sensitivity, F4 Scale and Exposure, F5 Reversibility and Recoverability, F6 Operational / Sector Criticality, F7 Adversarial Exposure and F8 Complexity and Auditability (5.3, Table 11).',
      },
      {
        kind: 'p',
        text: 'Each factor is scored on a four-point scale: 1 Low, 2 Moderate, 3 High, 4 Critical (5.4, Table 12). Eight factors scored 1 to 4 give a composite from 8 to 32, which maps to a tier (5.4, composite score table, also numbered Table 11):',
      },
      {
        kind: 'table',
        head: ['Composite score', 'Tier', 'Minimum audit requirement (5.4)'],
        rows: [
          ['8-12', 'Tier 1 (Low)', 'Self-assessment or basic internal review with documented evidence.'],
          [
            '13-19',
            'Tier 2 (Moderate)',
            'Documented internal audit with evidence of control implementation and effectiveness. Independent audit by CERT-In empanelled auditing organisations at least annually.',
          ],
          [
            '20-26',
            'Tier 3 (High)',
            'Periodic independent third-party audit by CERT-In empanelled auditing organisations; enhanced audit frequency where material changes, incidents or risk conditions warrant.',
          ],
          [
            '27-32',
            'Tier 4 (Critical)',
            'Independent audit by CERT-In empanelled auditing organisation with continuous monitoring.',
          ],
        ],
      },
      {
        kind: 'p',
        text: 'The composite is not the last word. "The auditor or system owner shall evaluate whether specific characteristics warrant escalation independent of the composite score", for example an AI that "can autonomously execute code, transactions or external communications" (5.4). If the auditor\'s tier differs from yours, "the higher tier shall apply for scoping purposes" (7.3, Step 2). Tiers are reassessed "at least annually" (5.6, Table 15).',
      },
      {
        kind: 'p',
        text: 'To see where your own system lands, use the free [AI risk tier calculator](/ai-risk-tier). It runs in your browser and is unofficial.',
      },
    ],
  },
  {
    id: 'small-companies',
    heading: 'What small companies must still do',
    blocks: [
      {
        kind: 'p',
        text: 'Section 5.7 gives MSMEs and startups relief, narrower than it looks:',
      },
      {
        kind: 'ul',
        items: [
          'Tier 1 systems run by MSMEs "may use a simplified self-assessment approach requiring minimal documentation overhead" (5.7).',
          'Tiers 1 and 2: depth "may be proportionate to system complexity and risk. Proportionality shall not remove mandatory security controls or prevent the auditor from obtaining sufficient and appropriate evidence" (5.7).',
          'Tiers 3 and 4: these "shall remain subject to the full applicable assurance requirements irrespective of organisational size" (5.7).',
        ],
      },
      {
        kind: 'p',
        text: 'It adds: "The security, safety, operational or systemic risk presented by an AI system does not diminish because the deploying organisation is small" (5.7). Proportionality changes how deep the work goes; a Tier 2 independent audit stays "at least annually" (5.4).',
      },
      {
        kind: 'p',
        text: 'Governance minimums scale by tier. Tier 1: "Designated AI system owner. Basic AI usage policy. Voluntary AIIA". Tier 2: "AI governance function established. Simplified AIIA mandatory. Model inventory maintained" (8.1, risk-tier applicability table).',
      },
    ],
  },
  {
    id: 'what-auditors-need',
    heading: 'What auditors will need',
    blocks: [
      {
        kind: 'p',
        text: 'Auditors start with your inventory (7.3, Step 1), confirming "purpose, owner, deployment status, data categories processed, model type, user population, and current risk tier classification". If it is missing, "this constitutes a governance non-conformity". The inventory control asks for a "Complete, current inventory of all AI systems with metadata: purpose, owner, risk tier, deployment status, data sources, and model type" (8.1, Audit Controls).',
      },
      {
        kind: 'p',
        text: 'Before fieldwork, auditors request documents, and "This list represents the minimum" (7.8, Table 32). Examples: AI governance policy, model cards, AI threat model, VAPT reports and API security test results (7.8, Table 32).',
      },
      {
        kind: 'p',
        text: 'The audit team itself must be qualified (7.6, Table 30). Six competency areas are listed, among them data governance and privacy (DPDPA 2023 is named) and adversarial AI (MITRE ATLAS and the OWASP ML/LLM Top 10 are named). For Tier 3-4, the team "shall include at least one member with demonstrated AI/ML technical competence" and "at least one member with professional audit certification (CISA, CIA, ISO 27001 Lead Auditor, or equivalent). Sole-auditor engagements are not permitted for Tier 3-4 systems" (7.6).',
      },
    ],
  },
  {
    id: 'thirty-day-plan',
    heading: 'A 30-day preparation plan',
    blocks: [
      {
        kind: 'p',
        text: 'This plan is Guild\'s suggestion, not part of the guideline. Each step names the section it prepares for.',
      },
      {
        kind: 'ul',
        items: [
          'Days 1-7, inventory: list every AI system, including third-party APIs, with purpose, owner, risk tier, deployment status, data sources and model type (7.3 Step 1; 8.1). Check exclusions (4.9).',
          'Days 8-14, score: rate each system on the eight factors and record "rationale, assumptions and evidence" for each score (5.3). Use the [calculator](/ai-risk-tier) and check the escalation triggers (5.4).',
          'Days 15-21, governance: name an AI system owner and write a basic AI usage policy (Tier 1). For Tier 2, set up a governance function, a simplified AIIA and a model inventory (8.1, risk-tier applicability table).',
          'Days 22-30, evidence: start collecting the Table 32 documents (7.8). Decide which systems are Tier 2 or above and need an empanelled auditor (5.4). Diarise the annual reassessment (5.6).',
        ],
      },
    ],
  },
  {
    id: 'open-questions',
    heading: 'Open questions',
    blocks: [
      {
        kind: 'p',
        text: 'We searched the text of the PDF for an effective date, a penalty, a sanction or an enforcement mechanism. We found no effective date and no penalty in the document. Section 4.9 refers to "mandatory compliance scope" and 5.7 to "mandatory security controls", but the document does not say who enforces them or by when. Treat enforcement as unclear.',
      },
      {
        kind: 'ul',
        items: [
          'Sectoral rules may add to this: tiers are reassessed "When a sectoral regulator issues new classification guidance" (5.6, Table 15).',
          'The list of CERT-In empanelled auditing organisations is not part of the PDF. Check CERT-In directly before engaging anyone.',
        ],
      },
    ],
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const EXPLAINER_FAQ: FaqItem[] = [
  {
    q: 'We only call a third-party model API. Are we in scope?',
    a: 'Yes. AI systems "shall remain within audit scope regardless of model origin, ownership or delivery mechanism", and AI-as-a-Service / API models are listed as a model source (4.6, Table 7).',
  },
  {
    q: 'We are a five-person startup. Are we exempt?',
    a: 'No. The framework applies to "all types and sizes of organisations" (4.4). Section 5.7 lets Tier 1 and Tier 2 documentation be proportionate, but Tier 3 and Tier 4 systems face full requirements "irrespective of organisational size" (5.7).',
  },
  {
    q: 'What tier is a customer-facing chatbot?',
    a: 'Scores decide, not product type (5.4). "internet-facing or publicly accessible" is the High description for F7 (5.3). For example, scoring 3 on F4 and F7 and 2 on the other six factors totals 18, which is Tier 2 (5.4).',
  },
  {
    q: 'When do we need a CERT-In empanelled auditor?',
    a: 'For Tier 2 and above: "at least annually" at Tier 2, and independent audits at Tiers 3 and 4 (5.4). Tier 1 needs self-assessment or basic internal review with documented evidence (5.4).',
  },
  {
    q: 'Is this a law with penalties?',
    a: 'The document states no effective date and no penalty, and we found no enforcement mechanism in it. Its text uses "mandatory compliance scope" (4.9) without saying who enforces it. Do not assume either way.',
  },
  {
    q: 'Can Guild audit us?',
    a: 'No. Guild is not a CERT-In empanelled auditor, and the guideline reserves independent audits at Tier 2 and above to empanelled organisations (5.4). Guild can help you prepare: inventory, scoring rationale and evidence. For a technical review of an AI-built app, see the [Production Check](/audit).',
  },
];

export function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
}

/** All visible copy as one string, for tests and word counts. */
export function explainerPlainText(): string {
  const parts: string[] = [EXPLAINER_TITLE, EXPLAINER_DESCRIPTION, ...EXPLAINER_SUMMARY];
  for (const s of EXPLAINER_SECTIONS) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === 'p') parts.push(b.text);
      else if (b.kind === 'ul') parts.push(...b.items);
      else if (b.kind === 'quote') parts.push(b.text, `(${b.cite})`);
      else parts.push(b.head.join(' '), ...b.rows.map((r) => r.join(' ')));
    }
  }
  for (const f of EXPLAINER_FAQ) parts.push(f.q, f.a);
  parts.push(EXPLAINER_DISCLAIMER);
  return parts.map(stripLinks).join('\n');
}
