// lib/quest-field-templates.ts
// Shared definitions for the Quest "Context Loop".
//
// A QuestFieldTemplate describes the structured fields collected on BOTH sides
// of a quest: what the company fills when posting (briefFields) and what the
// adventurer returns when submitting (submissionFields), plus the acceptance
// criteria the work is evaluated against. Templates live in the DB and are
// editable by admins / the AI Product Manager (guild-ai); the definitions below
// are the canonical defaults seeded into the DB and used as a fallback.

import type { QuestCategory, QuestType } from '@prisma/client';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'list'; // newline-separated → string[]

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // for `select`
}

export type FieldValue = string | number | boolean | string[] | null;
export type FieldValues = Record<string, FieldValue>;

export interface CriteriaResult {
  criterion: string;
  met: boolean;
  note?: string;
}

export interface FieldTemplateDef {
  name: string;
  description: string;
  questCategory: QuestCategory | null;
  questType: QuestType | null;
  briefFields: FieldDef[];
  submissionFields: FieldDef[];
  defaultCriteria: string[];
  isDefault: boolean;
}

// ── Reusable field fragments ───────────────────────────────────────────────
const repoUrl: FieldDef = {
  key: 'repoUrl',
  label: 'Repository URL',
  type: 'url',
  required: true,
  placeholder: 'https://github.com/org/repo',
};
const baseBranch: FieldDef = {
  key: 'baseBranch',
  label: 'Base branch',
  type: 'text',
  placeholder: 'main',
  helpText: 'Branch the work should be based on / merged into.',
};
const setupSteps: FieldDef = {
  key: 'setupSteps',
  label: 'Local setup steps',
  type: 'textarea',
  placeholder: 'How to install deps and run the project locally.',
};
const outOfScope: FieldDef = {
  key: 'outOfScope',
  label: 'Explicitly out of scope',
  type: 'textarea',
  helpText: 'List anything the adventurer should NOT touch.',
};

const prUrl: FieldDef = {
  key: 'prUrl',
  label: 'Pull request URL',
  type: 'url',
  required: true,
  placeholder: 'https://github.com/org/repo/pull/123',
};
const branchName: FieldDef = {
  key: 'branchName',
  label: 'Branch name',
  type: 'text',
  required: true,
  placeholder: 'feat/storage-driver',
};
const summary: FieldDef = {
  key: 'summary',
  label: 'Summary of what you did',
  type: 'textarea',
  required: true,
};
const knownLimitations: FieldDef = {
  key: 'knownLimitations',
  label: 'Known limitations / follow-ups',
  type: 'textarea',
};
const timeSpent: FieldDef = {
  key: 'timeSpentHours',
  label: 'Time spent (hours)',
  type: 'number',
};

// ── Canonical default templates (seeded to DB) ──────────────────────────────
export const DEFAULT_FIELD_TEMPLATES: FieldTemplateDef[] = [
  {
    name: 'General task',
    description: 'Fallback template for any work type without a specialised template.',
    questCategory: null,
    questType: null,
    isDefault: true,
    briefFields: [
      { key: 'contextLinks', label: 'Context links', type: 'list', placeholder: 'One link per line (repo, designs, docs)' },
      { key: 'scope', label: 'What is in scope', type: 'textarea', required: true },
      outOfScope,
      { key: 'resourcesProvided', label: 'Assets / access provided', type: 'textarea', helpText: 'Credentials, sample data, brand assets, etc.' },
      { key: 'definitionOfDone', label: 'Definition of done', type: 'textarea', required: true },
    ],
    submissionFields: [
      { key: 'deliverableUrl', label: 'Primary deliverable link', type: 'url', required: true },
      summary,
      { key: 'howToReview', label: 'How to review it', type: 'textarea', required: true },
      knownLimitations,
      timeSpent,
    ],
    defaultCriteria: [
      'Deliverable matches the stated scope',
      'Definition of done is met',
      'Work is documented well enough to review',
    ],
  },
  {
    name: 'Backend / API task',
    description: 'Server-side code: APIs, services, data layer, integrations.',
    questCategory: 'backend',
    questType: null,
    isDefault: false,
    briefFields: [
      repoUrl,
      baseBranch,
      { key: 'apiContract', label: 'API contract / data shapes', type: 'textarea', helpText: 'Endpoints, inputs/outputs, error cases.' },
      { key: 'filesInScope', label: 'Files / modules in scope', type: 'textarea' },
      outOfScope,
      setupSteps,
      { key: 'testCommand', label: 'Test command', type: 'text', placeholder: 'npm test' },
    ],
    submissionFields: [
      prUrl,
      branchName,
      { key: 'implementationSummary', label: 'What you implemented', type: 'textarea', required: true },
      { key: 'howToTest', label: 'How to run & test', type: 'textarea', required: true },
      { key: 'testsPass', label: 'All tests pass locally', type: 'checkbox' },
      { key: 'testEvidence', label: 'Test output / coverage notes', type: 'textarea' },
      knownLimitations,
      timeSpent,
    ],
    defaultCriteria: [
      'Code compiles and runs without errors',
      'Tests cover success and common error cases',
      'Public API matches the agreed contract',
      'No production credentials or secrets are committed',
    ],
  },
  {
    name: 'Frontend / UI task',
    description: 'Client-side components, screens, and interactions.',
    questCategory: 'frontend',
    questType: null,
    isDefault: false,
    briefFields: [
      repoUrl,
      baseBranch,
      { key: 'designLinks', label: 'Design links', type: 'list', placeholder: 'Figma / screenshot links, one per line' },
      { key: 'componentsInScope', label: 'Components / screens in scope', type: 'textarea', required: true },
      { key: 'responsiveTargets', label: 'Responsive targets', type: 'text', placeholder: 'mobile + desktop' },
      outOfScope,
      { key: 'testCommand', label: 'Test / run command', type: 'text', placeholder: 'npm run dev' },
    ],
    submissionFields: [
      prUrl,
      branchName,
      { key: 'demoUrl', label: 'Deployed preview / demo URL', type: 'url' },
      summary,
      { key: 'mediaLinks', label: 'Screenshots / recordings', type: 'list', placeholder: 'Link per line' },
      { key: 'howToTest', label: 'How to review it', type: 'textarea', required: true },
      { key: 'a11yChecked', label: 'Checked keyboard + screen-reader basics', type: 'checkbox' },
      knownLimitations,
      timeSpent,
    ],
    defaultCriteria: [
      'Matches the provided design within reason',
      'Works on the stated responsive targets',
      'Handles loading, empty, and error states',
      'No console errors',
    ],
  },
  {
    name: 'Full-stack task',
    description: 'Work spanning both client and server.',
    questCategory: 'fullstack',
    questType: null,
    isDefault: false,
    briefFields: [
      repoUrl,
      baseBranch,
      { key: 'featureSpec', label: 'Feature spec', type: 'textarea', required: true, helpText: 'User-facing behaviour end to end.' },
      { key: 'apiContract', label: 'API / data shapes', type: 'textarea' },
      { key: 'filesInScope', label: 'Files / modules in scope', type: 'textarea' },
      outOfScope,
      setupSteps,
      { key: 'testCommand', label: 'Test command', type: 'text', placeholder: 'npm test' },
    ],
    submissionFields: [
      prUrl,
      branchName,
      { key: 'demoUrl', label: 'Deployed preview / demo URL', type: 'url' },
      { key: 'implementationSummary', label: 'What you built (client + server)', type: 'textarea', required: true },
      { key: 'howToTest', label: 'How to run & test end to end', type: 'textarea', required: true },
      { key: 'testsPass', label: 'All tests pass locally', type: 'checkbox' },
      knownLimitations,
      timeSpent,
    ],
    defaultCriteria: [
      'Feature works end to end as specified',
      'Tests cover the core flow and error cases',
      'No production credentials or secrets are committed',
      'Handles loading, empty, and error states in the UI',
    ],
  },
  {
    name: 'QA / Testing task',
    description: 'Writing tests, reproducing bugs, validating behaviour.',
    questCategory: 'qa',
    questType: null,
    isDefault: false,
    briefFields: [
      repoUrl,
      baseBranch,
      { key: 'areaUnderTest', label: 'Area / feature under test', type: 'textarea', required: true },
      { key: 'testTypes', label: 'Test types expected', type: 'text', placeholder: 'unit, integration' },
      { key: 'fixturesProvided', label: 'Fixtures / sample data provided', type: 'textarea' },
      { key: 'testCommand', label: 'Test command', type: 'text', placeholder: 'npm test' },
    ],
    submissionFields: [
      prUrl,
      branchName,
      { key: 'testSummary', label: 'What you tested and added', type: 'textarea', required: true },
      { key: 'casesCovered', label: 'Cases covered (success + error/edge)', type: 'textarea', required: true },
      { key: 'testCommandRun', label: 'Command to run the tests', type: 'text', placeholder: 'npm test' },
      { key: 'allPass', label: 'All added tests pass', type: 'checkbox' },
      { key: 'coverageNotes', label: 'Coverage notes', type: 'textarea' },
      timeSpent,
    ],
    defaultCriteria: [
      'Tests describe both success and error cases',
      'Tests are deterministic and pass locally',
      'No external binaries or production credentials are required',
    ],
  },
  {
    name: 'Design task',
    description: 'Visual / UX deliverables.',
    questCategory: 'design',
    questType: null,
    isDefault: false,
    briefFields: [
      { key: 'brandAssets', label: 'Brand assets / references', type: 'list', placeholder: 'Link per line' },
      { key: 'deliverableFormat', label: 'Deliverable format', type: 'text', placeholder: 'Figma, PNG, SVG' },
      { key: 'dimensions', label: 'Dimensions / specs', type: 'text' },
      { key: 'scope', label: 'What is in scope', type: 'textarea', required: true },
      outOfScope,
    ],
    submissionFields: [
      { key: 'figmaUrl', label: 'Figma / design file URL', type: 'url', required: true },
      { key: 'exportLinks', label: 'Exported asset links', type: 'list', placeholder: 'Link per line' },
      summary,
      knownLimitations,
      timeSpent,
    ],
    defaultCriteria: [
      'Matches the brand and references provided',
      'Delivered in the requested format and dimensions',
      'Source file is editable / well organised',
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Narrow an unknown JSON blob (from DB) into a FieldDef[]. */
export function asFieldDefs(json: unknown): FieldDef[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (f): f is FieldDef =>
      !!f && typeof f === 'object' && typeof (f as FieldDef).key === 'string' && typeof (f as FieldDef).label === 'string',
  );
}

/** Narrow an unknown JSON blob into FieldValues. */
export function asFieldValues(json: unknown): FieldValues {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {};
  return json as FieldValues;
}

/** Narrow an unknown JSON blob into CriteriaResult[]. */
export function asCriteriaResults(json: unknown): CriteriaResult[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (r): r is CriteriaResult =>
      !!r && typeof r === 'object' && typeof (r as CriteriaResult).criterion === 'string',
  );
}

interface TemplateLike {
  questCategory: string | null;
  questType: string | null;
  isDefault: boolean;
}

/**
 * Pick the best template for a quest: an exact (category, type) match wins,
 * then category-only, then type-only, then the default, then the first one.
 */
export function pickTemplate<T extends TemplateLike>(
  templates: T[],
  category: string | null | undefined,
  type: string | null | undefined,
): T | undefined {
  if (templates.length === 0) return undefined;
  return (
    templates.find((t) => t.questCategory === category && t.questType === type && type != null) ??
    templates.find((t) => t.questCategory === category && category != null) ??
    templates.find((t) => t.questType === type && type != null) ??
    templates.find((t) => t.isDefault) ??
    templates[0]
  );
}

/** Validate values against field defs. Returns a list of human-readable errors. */
export function validateFieldValues(fields: FieldDef[], values: FieldValues): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    if (!field.required) continue;
    const v = values[field.key];
    const empty =
      v == null ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0);
    if (empty) errors.push(`${field.label} is required`);
  }
  return errors;
}

/** Convert structured values to a readable text blob (for legacy `submissionContent`). */
export function fieldValuesToText(fields: FieldDef[], values: FieldValues): string {
  return fields
    .map((f) => {
      const v = values[f.key];
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) return null;
      const rendered = Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
      return `${f.label}: ${rendered}`;
    })
    .filter(Boolean)
    .join('\n');
}
