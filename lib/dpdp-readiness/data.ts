import type { DpdpQuestion } from './engine';

// Sources
// - The Digital Personal Data Protection Act, 2023 (Act 22 of 2023), official PDF on meity.gov.in.
//   Section numbers below are Act section numbers.
// - The Digital Personal Data Protection Rules, 2025: Gazette notification G.S.R. 846(E),
//   notified 13 November 2025 and published in the Gazette of India (Extraordinary) on
//   14 November 2025, as reported by Bar & Bench and Mondaq (not read by us in the Gazette).
//
// The Rules text could not be opened when this was written, so no rule number is cited
// anywhere. Where the Rules fix a detail (timelines, forms, manner), the fix text says
// "as set in the Rules" and points to G.S.R. 846(E). The phase dates are as reported by
// secondary sources and are labelled that way wherever they are shown.

export const DPDP_ACT_TITLE = 'Digital Personal Data Protection Act, 2023';
export const DPDP_RULES_TITLE = 'Digital Personal Data Protection Rules, 2025';
export const DPDP_ACT_PDF_URL =
  'https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf';
export const DPDP_RULES_PAGE_URL =
  'https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025';
export const DPDP_RULES_NOTIFICATION =
  'G.S.R. 846(E), notified 13 November 2025 and published in the Gazette of India (Extraordinary) on 14 November 2025, as reported by Bar & Bench and Mondaq';

export interface PhaseDate {
  date: string;
  /** What the source reports for this date. Kept short; the Gazette text governs. */
  label: string;
}

// The Rules switch on in phases. We do not map any date to a particular rule.
export const DPDP_PHASE_DATES: PhaseDate[] = [
  { date: '14 November 2025', label: 'first phase' },
  { date: '14 November 2026', label: 'second phase' },
  { date: '14 May 2027', label: 'third phase' },
];

export const DPDP_PHASE_DATES_NOTE =
  'Phase dates as reported by Bar & Bench and Mondaq, not read by us in the Gazette. Which rule starts on which date, including for consent managers and the main obligations, is per the notified Rules. Check the Gazette (G.S.R. 846(E)) before you rely on any date.';

export const DPDP_DISCLAIMER =
  'This tool is an unofficial self-check. It is not legal advice and not an audit. Guild is not a CERT-In empanelled auditor.';

export const DPDP_SOURCE_NOTE =
  'Section numbers are those of the Act as published by MeitY. The Rules add details by rule number that this tool does not cite. Check the Gazette text of both before you act.';

export const DPDP_MAILTO = 'mailto:abid@guilds.work?subject=DPDP%20readiness';

export const DPDP_TOPIC_LABELS: Record<DpdpQuestion['topic'], string> = {
  notice: 'Notice',
  consent: 'Consent',
  'purpose-limitation': 'Purpose limitation',
  children: "Children's data",
  security: 'Security safeguards',
  breach: 'Breach notification',
  'retention-erasure': 'Retention and erasure',
  grievance: 'Grievance and contact',
  'significant-data-fiduciary': 'Significant Data Fiduciary',
  processors: 'Processors',
};

const sec = (ref: string) => ({ kind: 'section' as const, ref });

// Every question is phrased so that Yes means the obligation is met.
export const DPDP_QUESTIONS: DpdpQuestion[] = [
  {
    id: 'notice-content',
    topic: 'notice',
    question:
      'When you ask for consent, do you give each person a notice that lists the personal data you collect, the purpose, how they can exercise their rights, and how to complain to the Data Protection Board?',
    provision: sec('5(1)'),
    fix: 'Write one notice per purpose with an itemised list of the data, the purpose, the steps to withdraw consent or use other rights, and how to complain to the Board. Show it before or at the point you ask for consent.',
  },
  {
    id: 'notice-language',
    topic: 'notice',
    question:
      'Can each person choose to read the notice in English or in any language in the Eighth Schedule to the Constitution?',
    provision: sec('5(3)'),
    fix: 'Offer the notice in English and in the Eighth Schedule languages your users read, and let the person pick the language when they see it.',
  },
  {
    id: 'consent-quality',
    topic: 'consent',
    question:
      'Is consent free, specific, informed, unconditional and unambiguous, given by a clear action, and limited to the data necessary for the stated purpose?',
    provision: sec('6(1)'),
    fix: 'Remove pre-ticked boxes and bundled consents. Ask for each purpose separately, make the service not depend on consent to unrelated data, and record the clear action the user took.',
  },
  {
    id: 'consent-withdrawal',
    topic: 'consent',
    question: 'Can a person withdraw consent as easily as they gave it?',
    provision: sec('6(4)'),
    fix: 'Add a withdrawal option that takes no more steps than giving consent, for example one toggle in settings, and wire it to actually stop the processing.',
  },
  {
    id: 'lawful-ground',
    topic: 'consent',
    question:
      'For each use of personal data, can you point either to the person\'s consent or to a specific legitimate use listed in the Act?',
    provision: sec('4(1)'),
    fix: 'Make a table of every processing activity and next to each write the ground: consent, or the exact legitimate use in section 7. Where there is neither, stop the activity or start collecting consent.',
  },
  {
    id: 'purpose-fixed',
    topic: 'purpose-limitation',
    question:
      'Do you process personal data only for the purpose you told the person about, and ask again before using it for a new purpose?',
    provision: sec('4(1)'),
    fix: 'Keep a purpose register. Before a new use (for example analytics, model training or marketing on existing data), send a new notice and get fresh consent instead of reusing the old one.',
  },
  {
    id: 'data-minimal',
    topic: 'purpose-limitation',
    question: 'Do you collect only the personal data that is necessary for each stated purpose?',
    provision: sec('6(1)'),
    fix: 'Go through every form field and API payload. Delete the ones that no stated purpose needs, and stop collecting them.',
  },
  {
    id: 'child-parent-consent',
    topic: 'children',
    question:
      'If you may process data of anyone under 18, do you get verifiable consent from a parent or lawful guardian first? (Answer Yes if you do not process children\'s data.)',
    provision: sec('9(1)'),
    fix: 'Decide whether anyone under 18 can use the product. If yes, add an age gate and a parent or guardian consent step that you can later verify, with the method as set in the Rules (G.S.R. 846(E)). If no, block them and say so in your terms.',
  },
  {
    id: 'child-no-harm',
    topic: 'children',
    question:
      'Do you avoid any processing of a child\'s data that is likely to harm the child\'s well-being? (Answer Yes if you do not process children\'s data.)',
    provision: sec('9(2)'),
    fix: 'Review features that reach minors, such as feeds, streaks, notifications and purchases, and remove or change anything that could harm their well-being.',
  },
  {
    id: 'child-no-tracking',
    topic: 'children',
    question:
      'Do you avoid tracking, behavioural monitoring and targeted advertising aimed at children? (Answer Yes if you do not process children\'s data.)',
    provision: sec('9(3)'),
    fix: 'Switch off ad targeting, behavioural profiling and third-party trackers for any account that is or may be a child. Check your SDKs, since many ship with tracking on.',
  },
  {
    id: 'security-reasonable',
    topic: 'security',
    question:
      'Do you have reasonable security safeguards to prevent a personal data breach, such as encryption, access control and logging, for data you hold or that is processed for you?',
    provision: sec('8(5)'),
    fix: 'Write down your safeguards and close the obvious gaps first: encryption in transit and at rest, least-privilege access, multi-factor login for admins, secret rotation, and logs you keep long enough to investigate an incident. The Rules set minimums; see G.S.R. 846(E).',
  },
  {
    id: 'security-measures',
    topic: 'security',
    question:
      'Do you have appropriate technical and organisational measures, such as written policies, staff training and an owner, to show you comply with the Act?',
    provision: sec('8(4)'),
    fix: 'Name an owner for data protection, write a short privacy and security policy, train staff who touch personal data, and keep a record of the checks you run.',
  },
  {
    id: 'breach-plan',
    topic: 'breach',
    question:
      'Do you have a written plan to tell the Data Protection Board and each affected person about a personal data breach, in the form and time set in the Rules?',
    provision: sec('8(6)'),
    fix: 'Write an incident plan: who decides it is a breach, who writes to the Board and to affected people, a template for both, and a contact list. Take the exact content and deadlines from the Rules (G.S.R. 846(E)) and rehearse once.',
  },
  {
    id: 'erase-when-done',
    topic: 'retention-erasure',
    question:
      'Do you erase personal data, and make your processors erase it, when consent is withdrawn or the purpose is no longer served, unless a law requires you to keep it?',
    provision: sec('8(7)'),
    fix: 'Set a retention period for every data type, build a deletion job that runs on it, and make sure deletion reaches backups, analytics tools and processors. Keep a note of any law that makes you retain something.',
  },
  {
    id: 'rights-requests',
    topic: 'retention-erasure',
    question:
      'Can you act on a person\'s request to correct or erase their personal data?',
    provision: sec('12'),
    fix: 'Add a way to receive correction and erasure requests, an owner who handles them, and a tested way to find and change a person\'s data across your systems.',
  },
  {
    id: 'grievance-system',
    topic: 'grievance',
    question:
      'Do you have a grievance redressal system, so people can complain to you before going to the Board?',
    provision: sec('8(10)'),
    fix: 'Set up a grievance channel (a form or email), assign someone to answer, and set a response time you keep. People must get a real answer from you first.',
  },
  {
    id: 'grievance-contact',
    topic: 'grievance',
    question:
      'Do you publish the business contact details of your Data Protection Officer or of the person who answers questions about personal data?',
    provision: sec('8(9)'),
    fix: 'Publish a named role and an email on your privacy page and in the product, in the manner set in the Rules (G.S.R. 846(E)).',
  },
  {
    id: 'sdf-assessed',
    topic: 'significant-data-fiduciary',
    question:
      'Have you checked whether the volume and sensitivity of the data you process could get you notified as a Significant Data Fiduciary, and do you have a way to find out if you have been?',
    provision: sec('10(1)'),
    fix: 'The Central Government decides who is a Significant Data Fiduciary, using factors such as volume and sensitivity of data and risk to people. Estimate your volumes and categories, and set someone to watch for a notification that names you.',
  },
  {
    id: 'sdf-duties',
    topic: 'significant-data-fiduciary',
    question:
      'If you have been notified as a Significant Data Fiduciary, do you have a Data Protection Officer based in India, an independent data auditor and periodic impact assessments? (Answer Yes if you have not been notified.)',
    provision: sec('10(2)'),
    fix: 'If you are notified, appoint a Data Protection Officer based in India who reports to your board or equivalent, hire an independent data auditor, and run periodic data protection impact assessments. Details are in the Act and the Rules.',
  },
  {
    id: 'processor-contract',
    topic: 'processors',
    question:
      'Do you use a valid written contract with every processor that handles personal data for you, and do you stay responsible for what they do?',
    provision: sec('8(2)'),
    fix: 'List every vendor that touches personal data (cloud, email, analytics, payments, AI APIs). Put a contract in place with each that covers purpose, security and deletion, and remember that you stay responsible for them.',
  },
];
