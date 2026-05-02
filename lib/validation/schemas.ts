import {
  QuestCategory,
  QuestSource,
  QuestTrack,
  QuestType,
  SubmissionStatus,
  UserRank,
} from '@prisma/client';
import { z } from 'zod';

const trimmedString = (max: number, min = 1) =>
  z.string().trim().min(min).max(max);

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const emptyStringToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const optionalTrimmedString = (max: number) =>
  z.preprocess(emptyStringToUndefined, z.string().trim().max(max).optional());

const nullableTrimmedString = (max: number) =>
  z.preprocess(emptyStringToNull, z.string().trim().max(max).nullable().optional());

const nullableUrlString = z.preprocess(
  emptyStringToNull,
  z
    .string()
    .trim()
    .url('Please enter a valid URL, including https://')
    .max(2_048)
    .nullable()
    .optional()
);

const nullableDateSchema = z.preprocess((value) => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsedDate.getTime()) ? z.NEVER : parsedDate;
}, z.date().nullable().optional());

const positiveInt = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max);

const nonNegativeInt = (max: number) =>
  z.coerce.number().int().min(0).max(max);

const nullablePositiveMoney = z.preprocess(
  (value) => (value === '' || value == null ? null : value),
  z.coerce.number().finite().min(0).max(10_000_000).nullable()
);

export const registerPayloadSchema = z.object({
  name: trimmedString(100, 2),
  email: z.string().trim().email('Invalid email address').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
  role: z.enum(['adventurer', 'company']).default('adventurer'),
  companyName: optionalTrimmedString(120),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(254),
});

export const resetPasswordSchema = z.object({
  token: trimmedString(512, 32),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
});

export const profilePatchSchema = z.object({
  name: nullableTrimmedString(100),
  username: optionalTrimmedString(30),
  bio: nullableTrimmedString(1_000),
  location: nullableTrimmedString(120),
  website: nullableUrlString,
  github: nullableUrlString,
  linkedin: nullableUrlString,
  discord: nullableTrimmedString(80),
  companyName: nullableTrimmedString(120),
  companyWebsite: nullableUrlString,
  companyDescription: nullableTrimmedString(2_000),
});

const questBaseSchema = z.object({
  title: trimmedString(160, 3),
  description: trimmedString(2_000, 10),
  detailedDescription: nullableTrimmedString(10_000),
  questType: z.nativeEnum(QuestType),
  difficulty: z.nativeEnum(UserRank),
  xpReward: positiveInt(1, 100_000),
  skillPointsReward: nonNegativeInt(10_000).default(0),
  monetaryReward: nullablePositiveMoney.default(null),
  requiredSkills: z
    .array(trimmedString(60))
    .max(20, 'Please limit required skills to 20 items')
    .default([])
    .transform((skills) => [...new Set(skills)]),
  requiredRank: z.nativeEnum(UserRank).nullable().optional(),
  maxParticipants: z.preprocess(
    (value) => (value == null || value === '' ? null : value),
    z.coerce.number().int().min(1).max(100).nullable()
  ),
  questCategory: z.nativeEnum(QuestCategory),
  track: z.nativeEnum(QuestTrack).optional(),
  source: z.nativeEnum(QuestSource).optional(),
  parentQuestId: nullableTrimmedString(64),
  deadline: nullableDateSchema,
});

export const questCreateSchema = questBaseSchema.extend({
  companyId: optionalTrimmedString(64),
});

export const questUpdateSchema = z.object({
  questId: trimmedString(64),
}).merge(questBaseSchema.partial());

export const questAssignmentApplySchema = z.object({
  questId: trimmedString(64),
});

export const questSubmissionCreateSchema = z.object({
  assignmentId: trimmedString(64),
  submissionContent: trimmedString(10_000, 10),
  submissionNotes: nullableTrimmedString(2_000),
});

export const questSubmissionReviewSchema = z.object({
  submissionId: trimmedString(64),
  status: z.nativeEnum(SubmissionStatus),
  reviewNotes: nullableTrimmedString(2_000),
  qualityScore: z.coerce.number().int().min(0).max(100).nullable().optional(),
});

export function sanitizeSearchTerm(value: string | null | undefined, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function clampPaginationValue(
  value: string | null | undefined,
  options: { fallback: number; min: number; max: number }
) {
  const parsedValue = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsedValue)) {
    return options.fallback;
  }

  return Math.min(Math.max(parsedValue, options.min), options.max);
}
