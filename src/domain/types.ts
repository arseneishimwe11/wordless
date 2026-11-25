import type { PillColor } from './colors';
import type { HouseholdMarkId } from './household';
import type { PillForm } from './pillUnits';

/** The six times of day on the sun arc, in the order the day goes. */
export const TIMES_OF_DAY = [
  'sunrise',
  'midMorning',
  'midday',
  'afternoon',
  'sunset',
  'night',
] as const;

export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

/** What else the prescription says, in the order the Rules screen shows them. */
export const RULES = [
  'withFood',
  'emptyStomach',
  'withWater',
  'noAlcohol',
  'sleepiness',
  'keepCool',
  'shakeFirst',
] as const;

export type Rule = (typeof RULES)[number];

/** How the prescription gives the time. */
export const TIMING_MODES = ['fixed', 'every', 'whenNeeded'] as const;

export type TimingMode = (typeof TIMING_MODES)[number];

/** The intervals the "Every N hours" choice offers. */
export const EVERY_HOURS = [4, 6, 8, 12] as const;

export type EveryHours = (typeof EVERY_HOURS)[number];

/** "Only when needed" caps the count at 1–6 a day. */
export const MAX_PER_DAY = { min: 1, max: 6 } as const;

/**
 * When the doses go in. All three modes keep their own setting, as on the sun arc:
 * switching from "every 8 h" to "when needed" and back brings the 8 h doses back.
 * Only the field for the current `mode` decides what the sheet shows.
 */
export interface Timing {
  mode: TimingMode;
  /** The doses, in day order. Used by "fixed" and "every". */
  doses: TimeOfDay[];
  /** Used by "every". */
  everyHours: EveryHours;
  /** Used by "whenNeeded": never more than this in a day. */
  maxPerDay: number;
}

export const COURSE_UNITS = ['days', 'weeks'] as const;

export type CourseUnit = (typeof COURSE_UNITS)[number];

/** The longest course the "How long" field takes, in its unit. */
export const MAX_COURSE_AMOUNT = 90;

/**
 * How long the medicine goes on. `amount` is null until it's entered; "no end date"
 * keeps the amount, so turning it off again restores it.
 */
export interface Course {
  ongoing: boolean;
  amount: number | null;
  unit: CourseUnit;
}

export interface Medicine {
  id: string;
  /** As written on the box or prescription. May be empty: the sheet still works. */
  name: string;
  form: PillForm;
  /** The colour (a capsule's cap). */
  color: PillColor;
  /** A capsule's body. Other forms keep it but don't draw it. */
  color2: PillColor;
  /** A score line across a tablet or oval. Always false for other forms. */
  score: boolean;
  /** Tablets, capsules, ml, drops or puffs each time: one of the form's quantity steps. */
  qty: number;
  timing: Timing;
  course: Course;
  /** In the order of {@link RULES}. */
  rules: Rule[];
}

/** Someone in the household, with their own sheet. */
export interface Person {
  id: string;
  /** How the screens tell people apart ("Grandmother"); never printed. */
  label: string;
  mark: HouseholdMarkId;
  medicines: Medicine[];
}

export interface Household {
  people: Person[];
  /** Printed as "Prepared by …" on each sheet. May be empty. */
  preparedBy: string;
}
