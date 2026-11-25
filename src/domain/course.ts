import { MAX_COURSE_AMOUNT, type Course, type CourseUnit } from './types';

/** The course grid shows at most two weeks; a longer course adds "+ N more days". */
export const MAX_SHOWN_DAYS = 14;

/** An ongoing (or not yet entered) course shows one week of boxes. */
export const WEEK = 7;

/** The usual lengths offered as chips, in days. */
export const USUAL_LENGTHS = [5, 7, 10, 14] as const;

export const isOngoing = (course: Course): boolean => course.ongoing;

/** Not ongoing and no length yet: the boxes have no end to count to. */
export const isMissing = (course: Course): boolean => !course.ongoing && course.amount === null;

/** The length in days, or null when ongoing or missing. */
export function courseDays(course: Course): number | null {
  if (course.ongoing || course.amount === null) return null;
  return course.amount * (course.unit === 'weeks' ? WEEK : 1);
}

/** How many days of boxes the sheet draws. */
export function shownDays(course: Course): number {
  const days = courseDays(course);
  return days === null ? WEEK : Math.min(MAX_SHOWN_DAYS, days);
}

/** Days beyond the ones drawn ("+ 16 more days like these"). */
export function extraDays(course: Course): number {
  return Math.max(0, (courseDays(course) ?? 0) - MAX_SHOWN_DAYS);
}

const clampAmount = (n: number) => Math.min(MAX_COURSE_AMOUNT, Math.max(1, n));

/** Typing a length ends "no end date". Anything below 1 clears it. */
export function setAmount(course: Course, amount: number | null): Course {
  return {
    ...course,
    ongoing: false,
    amount: amount === null || amount < 1 ? null : clampAmount(Math.floor(amount)),
  };
}

/** Reads the length field: a whole number from 1 to 90, or null. */
export function parseAmount(text: string): number | null {
  const n = Number.parseInt(text, 10);
  return Number.isNaN(n) || n < 1 ? null : Math.min(n, MAX_COURSE_AMOUNT);
}

/**
 * The − and + buttons. From an empty field they start either side of a week
 * (− gives 7, + gives 7), as in the design.
 */
export function stepAmount(course: Course, direction: 1 | -1): Course {
  const from = course.amount ?? WEEK - direction;
  return { ...course, ongoing: false, amount: clampAmount(from + direction) };
}

export function setUnit(course: Course, unit: CourseUnit): Course {
  return { ...course, unit };
}

/** A usual-length chip: that many days. */
export function pickUsualLength(course: Course, days: number): Course {
  return { ...course, ongoing: false, unit: 'days', amount: clampAmount(days) };
}

/** Which usual-length chip is on. */
export function activeUsualLength(course: Course): number | null {
  if (course.ongoing || course.unit !== 'days') return null;
  return USUAL_LENGTHS.find((n) => n === course.amount) ?? null;
}

/** "No end date" is a toggle; the length typed before it comes back when it's turned off. */
export function setOngoing(course: Course, ongoing: boolean): Course {
  return { ...course, ongoing };
}
