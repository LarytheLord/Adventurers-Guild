// Source of truth for the DPDP guide. Sources: the Digital Personal Data Protection Act, 2023
// (official PDF on meity.gov.in) for section numbers, and the Digital Personal Data Protection
// Rules, 2025 (Gazette notification G.S.R. 846(E)). The Rules text could not be opened when this
// was written, so no rule number is cited and phase dates are labelled "as reported by".
// Inline links use the form [label](href).
import type { Block, ExplainerSection, FaqItem } from '@/lib/cert-in-explainer/content';
import { stripLinks } from '@/lib/cert-in-explainer/content';
import {
  DPDP_ACT_PDF_URL,
  DPDP_DISCLAIMER,
  DPDP_PHASE_DATES_NOTE,
  DPDP_QUESTIONS,
  DPDP_RULES_PAGE_URL,
} from '@/lib/dpdp-readiness/data';

export type { Block, ExplainerSection, FaqItem };

export const DPDP_GUIDE_PATH = '/guides/dpdp-rules-what-startups-must-do';
export const DPDP_GUIDE_TITLE = 'DPDP Rules 2025: what Indian startups must do';
export const DPDP_GUIDE_DESCRIPTION =
  'For Indian startup founders: what the Digital Personal Data Protection Act 2023 and the DPDP Rules 2025 (G.S.R. 846(E)) ask of you, with the Act section for each duty and a 30-day plan. Not legal advice.';
export const DPDP_GUIDE_PUBLISHED = '2026-11-12';
export const DPDP_GUIDE_DISCLAIMER = DPDP_DISCLAIMER;
export const DPDP_GUIDE_CHECK_NOTE =
  'Check the Gazette. We cite Act section numbers only. We did not read the Rules text when writing this, so it cites no rule number, and the phase dates are as reported by Bar & Bench and Mondaq.';

export const DPDP_GUIDE_SUMMARY: string[] = [
  'The Act is the Digital Personal Data Protection Act, 2023. The Rules are Gazette notification G.S.R. 846(E), notified 13 November 2025 and published in the Gazette of India (Extraordinary) on 14 November 2025, as reported by Bar & Bench and Mondaq.',
  'If you process digital personal data in India, or offer goods or services to people in India from abroad, the Act applies to you (section 3). A startup is not exempt by default.',
  'The core duties are a notice (5), valid consent or a listed legitimate use (4, 6, 7), security safeguards (8(5)), breach reporting (8(6)), erasure (8(7)), a grievance channel (8(10)) and extra care for children (9).',
  'Phase dates are as reported by secondary sources and are per the notified Rules. Read the [Rules page on MeitY](' + DPDP_RULES_PAGE_URL + ') and the Gazette before you rely on a date.',
];

export const DPDP_GUIDE_SECTIONS: ExplainerSection[] = [
  {
    id: 'what-was-published',
    heading: 'What the Act and the Rules are',
    blocks: [
      {
        kind: 'p',
        text: 'The [Digital Personal Data Protection Act, 2023](' + DPDP_ACT_PDF_URL + ') is the law. It sets duties for a "Data Fiduciary", the entity that decides why and how personal data is processed, and gives rights to the "Data Principal", the person the data is about. A "Data Processor" processes on behalf of a fiduciary (section 2).',
      },
      {
        kind: 'p',
        text: 'The Rules fill in the detail the Act leaves to rules, such as forms, timelines and manner. They were notified as G.S.R. 846(E) on 13 November 2025 and published in the Gazette of India (Extraordinary) on 14 November 2025, as reported by Bar & Bench and Mondaq. The [MeitY page](' + DPDP_RULES_PAGE_URL + ') carries them.',
      },
    ],
  },
  {
    id: 'phase-in',
    heading: 'When it applies: dates per the notified Rules',
    blocks: [
      {
        kind: 'p',
        text: 'The Rules do not all start on one day. Secondary sources report phased commencement on 14 November 2025, 14 November 2026 and 14 May 2027. ' + DPDP_PHASE_DATES_NOTE,
      },
      {
        kind: 'p',
        text: 'We do not say which obligation starts on which date. That is per the notified Rules, including for consent managers and the main obligations. The Gazette text is the only source to rely on.',
      },
    ],
  },
  {
    id: 'who-it-applies-to',
    heading: 'Who it applies to',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Processing of digital personal data within India, including data collected on paper and later digitised (section 3).',
          'Processing outside India if it is connected with offering goods or services to people in India (section 3).',
          'Processing by an individual for a personal or domestic purpose is outside the Act (section 3(c)(i)).',
          'Section 17(3) lets the Central Government exempt classes of Data Fiduciary, startups among them, from some provisions by notification. Check whether a notification covers you. Do not assume one does.',
        ],
      },
      {
        kind: 'p',
        text: 'Using a cloud provider, an email tool or an AI API does not take you out of scope. You stay the Data Fiduciary and they are processors (sections 2 and 8(1)).',
      },
    ],
  },
  {
    id: 'duties',
    heading: 'The duties, section by section',
    blocks: [
      {
        kind: 'table',
        head: ['Duty', 'Act section', 'What it means in practice'],
        rows: [
          ['Lawful purpose', '4(1)', 'Process only with consent or for a listed legitimate use.'],
          ['Notice', '5(1), 5(3)', 'Tell people what you collect, why, how to use their rights and how to complain (5(1)). Offer it in English or an Eighth Schedule language (5(3)).'],
          ['Consent', '6(1), 6(4)', 'Free, specific, informed, unconditional, unambiguous, by clear action, limited to what is necessary. Withdrawal as easy as giving.'],
          ['Legitimate uses', '7', 'A closed list of uses that do not need consent. Read the list.'],
          ['Technical and organisational measures', '8(4)', 'Policies, training and an owner, to show compliance.'],
          ['Security safeguards', '8(5)', 'Reasonable safeguards to prevent a personal data breach.'],
          ['Breach notification', '8(6)', 'Tell the Data Protection Board and each affected person, in the form and time set in the Rules.'],
          ['Erasure', '8(7)', 'Erase when consent is withdrawn or the purpose is served, unless a law requires retention. Make processors do the same.'],
          ['Processors', '8(2)', 'Engage a processor only under a valid contract.'],
          ['Contact and grievance', '8(9), 8(10)', 'Publish the business contact of a Data Protection Officer or another person who answers questions (8(9)) and run a grievance system (8(10)).'],
          ['Children', '9(1), 9(2), 9(3)', 'Verifiable parent or guardian consent, no harmful processing, no tracking, behavioural monitoring or targeted ads aimed at children.'],
          ['Significant Data Fiduciary', '10', 'Extra duties for those the Central Government notifies.'],
          ['Rights requests', '12', 'People can ask you to correct or erase their data.'],
        ],
      },
      {
        kind: 'p',
        text: 'Penalties are set in section 33 and the Schedule to the Act. Read them in the [Act PDF](' + DPDP_ACT_PDF_URL + ') for the amounts that apply to each duty.',
      },
    ],
  },
  {
    id: 'children',
    heading: 'Children: the strictest part for product teams',
    blocks: [
      {
        kind: 'p',
        text: 'Under the Act a child is a person under 18. You need verifiable consent from a parent or lawful guardian before processing a child\'s data (section 9(1)), and you must not process it in a way likely to harm the child\'s well-being (section 9(2)). Tracking, behavioural monitoring and targeted advertising directed at children are barred (section 9(3)). How verification works, and any exemptions, are per the notified Rules.',
      },
      {
        kind: 'p',
        text: 'If your product is not meant for minors, say so, and add an age check you can defend. Do not rely on a checkbox alone.',
      },
    ],
  },
  {
    id: 'significant-data-fiduciary',
    heading: 'Significant Data Fiduciary',
    blocks: [
      {
        kind: 'p',
        text: 'The Central Government can notify a Data Fiduciary as significant, based on factors such as the volume and sensitivity of the data you process and the risk to people (section 10(1)). If you are notified, you must appoint a Data Protection Officer based in India, an independent data auditor and run periodic data protection impact assessments (section 10(2)). Most early-stage startups will not be notified, but you should know what would trigger it.',
      },
    ],
  },
  {
    id: 'thirty-day-plan',
    heading: 'A 30-day plan',
    blocks: [
      { kind: 'p', text: 'This plan is Guild\'s suggestion, not part of the Act or the Rules. Each step names the section it prepares for.' },
      {
        kind: 'ul',
        items: [
          'Days 1-7, map the data: list what personal data you collect, where it goes, which vendors touch it and why (4, 8(2)).',
          'Days 8-14, notice and consent: write one notice per purpose, rebuild consent screens, add withdrawal (5, 6).',
          'Days 15-21, security and breach: close the basic gaps and write an incident plan with templates for the Board and for users (8(5), 8(6)).',
          'Days 22-30, retention, grievance, children: set retention periods and a deletion job, publish a contact, open a grievance channel and decide how you handle minors (8(7), 8(9), 8(10), 9).',
        ],
      },
      { kind: 'p', text: 'To see where you stand now, use the free [DPDP readiness check](/dpdp-readiness). It runs in your browser.' },
    ],
  },
  {
    id: 'open-questions',
    heading: 'What we have not checked',
    blocks: [
      {
        kind: 'ul',
        items: [
          'We did not read the Rules text. Timelines for breach reports, the verification method for children and the minimum security measures are per the notified Rules.',
          'We do not know which rule starts on which phase date.',
          'Notifications under section 17(3), and any notification of Significant Data Fiduciaries, change who must do what. Check for them.',
        ],
      },
    ],
  },
];

export const DPDP_GUIDE_FAQ: FaqItem[] = [
  {
    q: 'Does the DPDP Act apply to a small startup?',
    a: 'Yes, in general. Section 3 applies to processing of digital personal data in India and to offering goods or services to people in India from abroad. Section 17(3) lets the Central Government exempt classes of Data Fiduciary, startups among them, from some provisions by notification, so check whether one covers you.',
  },
  {
    q: 'What is the date the DPDP Rules 2025 start?',
    a: 'The Rules are G.S.R. 846(E), notified 13 November 2025 and published on 14 November 2025, as reported by Bar & Bench and Mondaq. Phase dates of 14 November 2025, 14 November 2026 and 14 May 2027 are as reported by Bar & Bench and Mondaq. Which obligation starts when is per the notified Rules, so check the Gazette.',
  },
  {
    q: 'Do I need a Data Protection Officer?',
    a: 'Only a Significant Data Fiduciary must appoint one based in India (section 10(2)). Every fiduciary must publish the contact details of a Data Protection Officer or another person who answers questions (section 8(9)).',
  },
  {
    q: 'What counts as a valid consent?',
    a: 'Consent must be free, specific, informed, unconditional and unambiguous, given by a clear affirmative action, and limited to the data necessary for the purpose (section 6(1)). A person must be able to withdraw it as easily as they gave it (section 6(4)).',
  },
  {
    q: 'What do I do if there is a data breach?',
    a: 'Section 8(6) requires you to tell the Data Protection Board and each affected person. The form and the time limit are per the notified Rules, so read them in the Gazette and keep a written incident plan ready.',
  },
  {
    q: 'Can Guild certify that we comply?',
    a: 'No. Guild is not a CERT-In empanelled auditor, and this guide and the readiness check are not legal advice. They help you find gaps to take to a lawyer.',
  },
];

export const DPDP_QUESTION_TOTAL = DPDP_QUESTIONS.length;

/** All visible copy as one string, for tests. */
export function dpdpGuidePlainText(): string {
  const parts: string[] = [DPDP_GUIDE_TITLE, DPDP_GUIDE_DESCRIPTION, DPDP_GUIDE_CHECK_NOTE, ...DPDP_GUIDE_SUMMARY];
  for (const s of DPDP_GUIDE_SECTIONS) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === 'p') parts.push(b.text);
      else if (b.kind === 'ul') parts.push(...b.items);
      else if (b.kind === 'quote') parts.push(b.text, `(${b.cite})`);
      else parts.push(b.head.join(' '), ...b.rows.map((r) => r.join(' ')));
    }
  }
  for (const f of DPDP_GUIDE_FAQ) parts.push(f.q, f.a);
  parts.push(DPDP_GUIDE_DISCLAIMER);
  return parts.map(stripLinks).join('\n');
}
