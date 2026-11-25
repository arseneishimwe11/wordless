import { courseDays, scheduledDoses, type Medicine } from '@/domain';

/** A strip a day, for the whole course, up to four weeks (four pages) at a time. */
export const MAX_STRIP_DAYS = 28;

export const STRIPS_PER_PAGE = 7;

/** How many days of strips: the longest course, or a week for one with no end date. */
export function stripDays(medicines: readonly Medicine[]): number {
  const lengths = medicines.map((m) => courseDays(m.course) ?? 7);
  return Math.min(MAX_STRIP_DAYS, Math.max(1, ...lengths));
}

/** Is this medicine still being taken on day `day` (from 1)? */
export const activeOn = (medicine: Medicine, day: number): boolean =>
  day <= (courseDays(medicine.course) ?? Infinity);

/** The scheduled medicines with a dose at each column's time. */
export const isScheduled = (medicine: Medicine): boolean =>
  scheduledDoses(medicine.timing).length > 0;
