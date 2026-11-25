/**
 * The data model as runtime schemas, for anything read back from outside the
 * running app: on-device storage and scanned codes. The TypeScript types in
 * types.ts are the source; these schemas are checked against them below.
 */
import { z } from 'zod';

import { PILL_COLORS } from './colors';
import { HOUSEHOLD_MARKS } from './household';
import { QTY_STEPS } from './medicine';
import { PILL_FORMS } from './pillUnits';
import {
  COURSE_UNITS,
  EVERY_HOURS,
  MAX_COURSE_AMOUNT,
  MAX_PER_DAY,
  RULES,
  TIMES_OF_DAY,
  TIMING_MODES,
  type Course,
  type Household,
  type Medicine,
  type Person,
  type Timing,
} from './types';

/** Names and labels are short; this also keeps each one within a byte-length prefix. */
export const MAX_TEXT_LENGTH = 60;

/** More medicines than one sheet can hold is a mistake, not a prescription. */
export const MAX_MEDICINES = 12;

const text = z.string().max(MAX_TEXT_LENGTH);

const unique = (list: readonly unknown[]) => new Set(list).size === list.length;

export const timingSchema = z.object({
  mode: z.enum(TIMING_MODES),
  doses: z.array(z.enum(TIMES_OF_DAY)).refine(unique),
  everyHours: z.union(EVERY_HOURS.map((h) => z.literal(h))),
  maxPerDay: z.int().min(MAX_PER_DAY.min).max(MAX_PER_DAY.max),
});

export const courseSchema = z.object({
  ongoing: z.boolean(),
  amount: z.int().min(1).max(MAX_COURSE_AMOUNT).nullable(),
  unit: z.enum(COURSE_UNITS),
});

export const medicineSchema = z
  .object({
    id: z.string().min(1),
    name: text,
    form: z.enum(PILL_FORMS),
    color: z.enum(PILL_COLORS),
    color2: z.enum(PILL_COLORS),
    score: z.boolean(),
    qty: z.number(),
    timing: timingSchema,
    course: courseSchema,
    rules: z.array(z.enum(RULES)).refine(unique),
  })
  .refine((m) => QTY_STEPS[m.form].includes(m.qty), { path: ['qty'] })
  .refine((m) => !m.score || m.form === 'tablet' || m.form === 'oval', { path: ['score'] })
  .refine((m) => !(m.rules.includes('withFood') && m.rules.includes('emptyStomach')), {
    path: ['rules'],
  });

export const personSchema = z.object({
  id: z.string().min(1),
  label: text,
  mark: z.enum(HOUSEHOLD_MARKS),
  medicines: z.array(medicineSchema).max(MAX_MEDICINES),
});

export const householdSchema = z.object({
  people: z
    .array(personSchema)
    .max(HOUSEHOLD_MARKS.length)
    // Two people can't share a mark: the marks are how their sheets are told apart.
    .refine((people) => unique(people.map((p) => p.mark))),
  preparedBy: text,
});

/** The details printed with a sheet's code. Dates from 2020 to 2199 fit the code's day count. */
export const metaSchema = z.object({
  preparedBy: text,
  preparedOn: z.iso
    .date()
    .refine((d) => d >= '2020-01-01' && d <= '2199-06-05')
    .nullable(),
});

// The schemas and the types must describe the same data: this fails to compile if not.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
export type SchemasMatchTypes = [
  Assert<Same<z.infer<typeof timingSchema>, Timing>>,
  Assert<Same<z.infer<typeof courseSchema>, Course>>,
  Assert<Same<z.infer<typeof medicineSchema>, Medicine>>,
  Assert<Same<z.infer<typeof personSchema>, Person>>,
  Assert<Same<z.infer<typeof householdSchema>, Household>>,
];
