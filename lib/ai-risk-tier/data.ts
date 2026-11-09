// Source: CERT-In, "Artificial Intelligence (AI) Security Auditing Guidelines",
// Version 1.0, dated 04 November 2026. Section 5.3 (Table 11, risk factors),
// 5.4 (Table 12 scoring scale; composite score table, also numbered Table 11).
// Text is copied from the guideline and kept ASCII (en dashes written as hyphens).

export const CERTIN_PDF_URL = 'https://www.cert-in.org.in/PDF/AI_Security_Auditing_Guidelines.pdf';

export type FactorId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8';

export interface RiskFactor {
  id: FactorId;
  name: string;
  /** The guideline's assessment question. */
  question: string;
  /** Tier calibration guide, in order Low, Moderate, High, Critical (scores 1 to 4). */
  levels: [string, string, string, string];
  /** Extra sentence from the guideline's calibration cell, if any. */
  note?: string;
}

export const AI_RISK_FACTORS: RiskFactor[] = [
  {
    id: 'F1',
    name: 'Impact Severity',
    question: 'What is the potential consequence of an incorrect, compromised or unsafe AI output?',
    levels: [
      'negligible operational effect.',
      'limited recoverable impact.',
      'significant financial, operational, safety or service impact.',
      'systemic, safety-critical or potentially irreversible impact.',
    ],
  },
  {
    id: 'F2',
    name: 'Autonomy and Actionability',
    question:
      'What decisions, tool invocations or external actions can the AI initiate or materially influence before reliance on human approval or protective controls?',
    levels: [
      'advisory output with no action interface.',
      'bounded recommendations used in a human-executed workflow.',
      'initiates consequential or semi-autonomous actions.',
      'independently plans and executes consequential multi-step or safety-critical actions.',
    ],
    note: 'Test the effectiveness of approval and override mechanisms separately.',
  },
  {
    id: 'F3',
    name: 'Data Sensitivity',
    question: 'What type and sensitivity of information is processed by the AI system?',
    levels: [
      'public/non-sensitive.',
      'internal or personal information.',
      'sensitive, confidential, financial or health information.',
      'highly sensitive, biometric, classified or critical-infrastructure information.',
    ],
  },
  {
    id: 'F4',
    name: 'Scale and Exposure',
    question: 'What is the scale, frequency and reach of AI use?',
    levels: [
      'Limited internal use, low transaction or execution volume and limited operational reach.',
      'Controlled external use or moderate user/transaction volume with contained impact.',
      'Large-scale, frequent or customer-facing use with significant organisational or sectoral impact.',
      'Population-scale, systemic, national-scale or critical-sector deployment where failure or compromise may have widespread consequences.',
    ],
  },
  {
    id: 'F5',
    name: 'Reversibility and Recoverability',
    question:
      'How reversible are the consequences of an incorrect or unsafe output or action, before reliance on tested recovery arrangements?',
    levels: [
      'readily reversible consequence.',
      'recoverable with bounded effort.',
      'difficult, costly or time-sensitive to reverse.',
      'potentially irreversible physical, operational or systemic harm.',
    ],
    note: 'Operational recovery readiness is assessed separately.',
  },
  {
    id: 'F6',
    name: 'Operational / Sector Criticality',
    question: 'Does the AI support an essential, regulated, safety-critical or critical-infrastructure function?',
    levels: [
      'non-critical supporting use.',
      'important business function.',
      'core or regulated operation.',
      'critical infrastructure, safety-critical or national-security function.',
    ],
  },
  {
    id: 'F7',
    name: 'Adversarial Exposure',
    question: 'How exposed is the AI system to external users, hostile inputs or sophisticated threat actors?',
    levels: [
      'isolated/internal.',
      'controlled external exposure.',
      'internet-facing or publicly accessible.',
      'actively targeted or high-threat environment.',
    ],
  },
  {
    id: 'F8',
    name: 'Complexity and Auditability',
    question:
      'How do architectural complexity, model opacity and dependencies affect the ability to understand and assess the system, before reliance on its audit-trail or explanation controls?',
    levels: [
      'simple, transparent behaviour.',
      'bounded complexity.',
      'complex or partially opaque dependencies.',
      'material black-box or emergent behaviour with substantial assurance uncertainty.',
    ],
    note: 'Missing evidence shall not justify a low score or an automatic exclusion.',
  },
];

/** Table 12, Risk Factor Scoring Scale. */
export const AI_RISK_SCORES = [
  { value: 1, label: 'Low', meaning: 'The factor presents negligible risk in the context of this AI system.' },
  {
    value: 2,
    label: 'Moderate',
    meaning: 'The factor presents limited risk that can be managed through standard controls and human oversight.',
  },
  {
    value: 3,
    label: 'High',
    meaning:
      'The factor presents significant risk requiring enhanced controls, independent validation, and active monitoring.',
  },
  {
    value: 4,
    label: 'Critical',
    meaning:
      'The factor presents severe or systemic risk requiring the highest level of governance, continuous monitoring, and mandatory independent audit.',
  },
] as const;

export interface RiskTier {
  tier: 1 | 2 | 3 | 4;
  label: 'Low' | 'Moderate' | 'High' | 'Critical';
  min: number;
  max: number;
  /** Minimum Audit Requirement, as quoted in the composite score table. */
  requirement: string;
}

export const AI_RISK_TIERS: RiskTier[] = [
  {
    tier: 1,
    label: 'Low',
    min: 8,
    max: 12,
    requirement: 'Self-assessment or basic internal review with documented evidence.',
  },
  {
    tier: 2,
    label: 'Moderate',
    min: 13,
    max: 19,
    requirement:
      'Documented internal audit with evidence of control implementation and effectiveness. Independent audit by CERT-In empanelled auditing organisations at least annually.',
  },
  {
    tier: 3,
    label: 'High',
    min: 20,
    max: 26,
    requirement:
      'Periodic Independent third-party audit by CERT-In empanelled auditing organisations; enhanced audit frequency where material changes, incidents or risk conditions warrant.',
  },
  {
    tier: 4,
    label: 'Critical',
    min: 27,
    max: 32,
    requirement: 'Independent audit by CERT-In empanelled auditing organisation with continuous monitoring.',
  },
];

/** Sum of all eight scores, or null until every factor has a 1 to 4 score. */
export function compositeScore(scores: Partial<Record<FactorId, number>>): number | null {
  let total = 0;
  for (const f of AI_RISK_FACTORS) {
    const v = scores[f.id];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 4) return null;
    total += v;
  }
  return total;
}

export function tierForScore(score: number): RiskTier | null {
  return AI_RISK_TIERS.find((t) => score >= t.min && score <= t.max) ?? null;
}

/** Section 5.4 escalation triggers: the tier can be raised independent of the score. */
export const AI_RISK_ESCALATION_NOTE =
  'The guideline says the composite score "shall normally determine the assigned risk tier", but the auditor or system owner shall evaluate whether specific characteristics warrant escalation independent of the score (Section 5.4). Examples include autonomous safety-critical actions, privileged access to production systems, autonomous execution of code, transactions or external communications, and systems that cannot be reliably interrupted or rolled back.';

export const AI_RISK_PREPARE = [
  {
    section: '8.1',
    title: 'Inventory of your AI systems',
    detail:
      'A complete, current inventory of all AI systems with metadata: purpose, owner, risk tier, deployment status, data sources, and model type. The guideline treats a missing or incomplete inventory as a governance non-conformity (Section 7.3, Step 1).',
  },
  {
    section: '5.3',
    title: 'Your factor scores and the reasons for them',
    detail:
      'For each system, record the system/version, use case, assessment period, foreseeable misuse or failure scenarios, rationale, assumptions and evidence for each score. Score the inherent risk, without taking credit for claimed controls.',
  },
  {
    section: '4.10',
    title: 'Documentation of purpose, limits, architecture and risk category',
    detail:
      'Section 4.10 says to document all AI systems and classify each one. Table 9 (lifecycle coverage): the design and procurement stage covers intended use, system boundaries, architecture, risk classification, AI risk and impact assessment, threat modelling, security requirements, vendor due diligence and contractual assurance requirements.',
  },
  {
    section: '8.1',
    title: 'AI Risk and Impact Assessment (AIIA)',
    detail:
      'A documented assessment, performed before deployment and after material changes, of the intended use, foreseeable misuse, and the security, privacy, fairness, safety, operational and third-party risks. Table 14 lists it as optional for Tier 1 and mandatory for Tiers 2 to 4.',
  },
  {
    section: '7.3',
    title: 'Statement of Applicability',
    detail:
      'Prepared by the auditor for the engagement: applicable controls and external requirements, controls assessed as not applicable with justification, compensating controls, residual risks, and scope limitations. You can help by listing the CERT-In directions, sector rules and contract clauses that apply to you.',
  },
  {
    section: '7.8',
    title: 'Evidence the auditor will ask for before fieldwork',
    detail:
      'Examples from the pre-audit documentation request: AI governance policy, RACI matrix, model registry export, model cards, AI threat model, adversarial testing and VAPT reports, performance monitoring configuration, human oversight procedures, vendor due-diligence records and provenance evidence.',
  },
  {
    section: '5.6',
    title: 'A plan to re-assess the tier',
    detail:
      'Tier reassessment is required at least annually, before production deployment of a planned material change, and after incidents. A tier can only move down after a documented reassessment shows a sustained reduction in risk.',
  },
];

const MAIL_BODY = [
  'Hi,',
  '',
  'I would like help getting ready for the CERT-In AI Security Auditing Guidelines.',
  '',
  'Company:',
  'AI systems we run (what each one does):',
  'Tier result from the calculator (score and tier):',
  'Anything you are worried about:',
].join('\n');

export const AI_RISK_TIER_MAILTO = `mailto:abid@guilds.work?subject=AI%20audit%20readiness&body=${encodeURIComponent(MAIL_BODY)}`;
