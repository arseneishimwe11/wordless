import { isMissing } from './course';
import { dosesPerDay } from './timing';
import type { Medicine } from './types';

/** The steps of entering a medicine. */
export const ENTRY_STEPS = ['medicine', 'when', 'howLong', 'rules'] as const;

export type EntryStep = (typeof ENTRY_STEPS)[number];

export type StepIssue = 'noTimes' | 'noLength';

/**
 * What stops each step from continuing. The medicine and rules steps always can:
 * a name is optional, and "no rules" is an answer.
 */
export function stepIssue(medicine: Medicine, step: EntryStep): StepIssue | null {
  if (step === 'when') {
    return medicine.timing.mode !== 'whenNeeded' && dosesPerDay(medicine.timing) === 0
      ? 'noTimes'
      : null;
  }
  if (step === 'howLong') return isMissing(medicine.course) ? 'noLength' : null;
  return null;
}

export function stepIssues(medicine: Medicine): StepIssue[] {
  return ENTRY_STEPS.flatMap((step) => stepIssue(medicine, step) ?? []);
}

/** Ready to go on the sheet. */
export const isComplete = (medicine: Medicine): boolean => stepIssues(medicine).length === 0;
