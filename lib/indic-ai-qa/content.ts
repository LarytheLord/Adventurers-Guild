// Copy for /indic-ai-qa. Plain ASCII. No prices, no client names or claims, no auditor claims.
// The pilot method is described here in words; Guild's judge-agreement harness is not linked
// because it is not in this repository yet.

export const INDIC_QA_PATH = '/indic-ai-qa';
export const INDIC_QA_PUBLISHED = '2026-11-11';

export const INDIC_QA_TITLE = 'AI quality checks for Hindi, Gujarati and Hinglish - Guild';
export const INDIC_QA_DESCRIPTION =
  'A two-week pilot for teams shipping chatbots, voice agents or LLM features in Hindi, Gujarati or Hinglish. Native speakers check meaning, politeness, code-mixing, refusals and judge agreement. Guild is not a CERT-In empanelled auditor.';

export const INDIC_QA_MAILTO = 'mailto:abid@guilds.work?subject=Indic%20AI%20QA%20pilot';

export const INDIC_QA_HERO = {
  eyebrow: 'Hindi, Gujarati and Hinglish',
  title: 'Does your AI say the right thing in Hindi, Gujarati and Hinglish?',
  lead:
    'If you ship a chatbot, a voice agent or an LLM feature for people who write and speak Hindi, Gujarati or Hinglish, an English test set will not tell you how it behaves. We test it with native speakers and tell you plainly what we find.',
};

export const INDIC_QA_CHECKS_TITLE = 'What we check';
export const INDIC_QA_CHECKS = [
  {
    id: 'meaning-errors',
    title: 'Meaning errors',
    body:
      'Does the answer say what the source or the user meant? We look for dropped negations, wrong numbers, wrong dates, swapped names and fluent sentences that are quietly wrong.',
  },
  {
    id: 'register-politeness',
    title: 'Register and politeness',
    body:
      'We check that the system speaks at a level of formality that suits your users, and that it does not switch between formal and casual inside one conversation.',
  },
  {
    id: 'code-mixing',
    title: 'Code-mixing',
    body:
      'Real users mix English words into Hindi and Gujarati sentences. We check that the system understands mixed input, and that it answers in a mix that sounds natural to your users instead of forcing pure Hindi or pure English.',
  },
  {
    id: 'transliteration',
    title: 'Transliteration',
    body:
      'Many people type Hindi or Gujarati in Roman letters. We check that the system reads Roman-script input, that names and places survive the trip between scripts, and that a voice agent says them the way a speaker would.',
  },
  {
    id: 'refusals',
    title: 'Refusals',
    body:
      'We test two things in each language, including Roman-script input: whether the system refuses a harmless request, and whether it goes along with a harmful one.',
  },
  {
    id: 'policy-hallucination',
    title: 'Policy hallucination',
    body:
      'When a user asks about refunds, eligibility, fees or deadlines, does the system invent a rule your company does not have? We compare its answers with your written policy, in each language.',
  },
  {
    id: 'judge-agreement',
    title: 'Judge agreement',
    body:
      'If you use an LLM to score outputs, we check whether that judge agrees with native-speaker raters in each language, and whether its verdict changes when you reorder the answers or ask it twice.',
  },
];

export const INDIC_QA_PILOT_TITLE = 'How the two-week pilot works';
export const INDIC_QA_PILOT_INTRO =
  'The pilot is small on purpose. It is a smoke test of one system, in the languages you pick, and it tells you where to look harder.';
export const INDIC_QA_PILOT = [
  {
    title: 'Before week one: written scope',
    body:
      'We agree in writing which system, which languages, which of the seven checks, and what we may and may not test. We only test systems you own or are allowed to test.',
  },
  {
    title: 'Week one: build the sample',
    body:
      'You send realistic prompts, your system prompt and your written policies. We add test cases for each check, in each language, and agree the final sample with you. Keep it small enough to be rated carefully by hand.',
  },
  {
    title: 'Week one: native-speaker rating',
    body:
      'At least two native speakers per language rate each response on their own, using one shared rubric. We first measure how often the raters agree with each other. If they do not agree, the rubric is unclear and we fix it before we trust any score.',
  },
  {
    title: 'Week two: judge check',
    body:
      'If you score outputs with an LLM judge, we run it on the same items and compare it with the human labels. We report agreement beyond chance, how often the verdict flips when the answer order is swapped, and how often it changes on a repeat run. Each figure comes with an interval, because the sample is small.',
  },
  {
    title: 'Week two: report and walkthrough',
    body:
      'We send a written report and walk your team through it. Each finding has a severity, the exact input and output, and the language it occurred in, so your team can reproduce it.',
  },
];

export const INDIC_QA_DELIVERABLES_TITLE = 'What you get';
export const INDIC_QA_DELIVERABLES = [
  'A written report with each finding rated critical, high, medium or low.',
  'The test cases, the rubric and the raw ratings, so you can rerun the check yourself.',
  'Rater agreement per language, so you know how far to trust the scores.',
  'Judge-versus-human agreement per language, if you use an LLM judge.',
  'A short list of fixes to try first, such as prompt changes, glossary entries or policy text to put in front of the model.',
  'A walkthrough call with your team.',
];

export const INDIC_QA_LIMITS_TITLE = 'What this is not';
export const INDIC_QA_LIMITS = [
  'It is not a benchmark. A small sample finds problems; it does not prove there are none.',
  'It covers the version of the system we tested, on the day we tested it.',
  'It does not replace testing with your own users.',
  'Guild is not a CERT-In empanelled auditor. We do not issue an audit or a certificate, and this page is not legal advice.',
];

export const INDIC_QA_CITATION_TITLE = 'Background reading';
export const INDIC_QA_CITATION = {
  label:
    'PARIKSHA: A Large-Scale Investigation of Human-LLM Evaluator Agreement on Multilingual and Multi-Cultural Data (arXiv 2406.15053)',
  href: 'https://arxiv.org/abs/2406.15053',
  note: 'A paper that studies how well human and LLM evaluators agree on multilingual data. We link it as background only.',
};

export const INDIC_QA_CONTACT = {
  title: 'Talk to us',
  body:
    'Tell us what you ship, in which languages, and what worries you. We reply by email and tell you plainly if a pilot is a good fit.',
  label: 'Email abid@guilds.work',
};
