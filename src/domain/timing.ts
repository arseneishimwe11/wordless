import { sunArcMotion } from '@/styles/tokens';

import {
  MAX_PER_DAY,
  TIMES_OF_DAY,
  type EveryHours,
  type TimeOfDay,
  type Timing,
  type TimingMode,
} from './types';

/** The four colour families of the day; each names a group of colour tokens. */
export type DayPhase = 'sunrise' | 'midday' | 'sunset' | 'night';

export interface TimeInfo {
  /** Where the time sits on the sun arc, in degrees: 180 is the eastern horizon, 0 the western. */
  angle: number;
  phase: DayPhase;
}

/** The sun arc's six stops (from SunArc.dc.html). */
export const TIMES: Record<TimeOfDay, TimeInfo> = {
  sunrise: { angle: 172, phase: 'sunrise' },
  midMorning: { angle: 131, phase: 'sunrise' },
  midday: { angle: 90, phase: 'midday' },
  afternoon: { angle: 49, phase: 'midday' },
  sunset: { angle: 8, phase: 'sunset' },
  night: { angle: -90, phase: 'night' },
};

export type TimesADay = 1 | 2 | 3 | 4;

/** The "times a day" chips and where they put the doses. */
export const TIMES_A_DAY: Record<TimesADay, readonly TimeOfDay[]> = {
  1: ['sunrise'],
  2: ['sunrise', 'sunset'],
  3: ['sunrise', 'midday', 'sunset'],
  4: ['sunrise', 'midday', 'sunset', 'night'],
};

/**
 * Where "every N hours" puts the doses, as drawn in the design. These are the
 * nearest times of day, not exact intervals: every 4 h becomes the six stops about
 * 3 h apart, and every 6 h leaves a 4 h gap before night.
 * CLINICAL REVIEW: confirm this mapping with a pharmacist before release.
 */
export const EVERY: Record<EveryHours, readonly TimeOfDay[]> = {
  4: ['sunrise', 'midMorning', 'midday', 'afternoon', 'sunset', 'night'],
  6: ['sunrise', 'midday', 'sunset', 'night'],
  8: ['sunrise', 'afternoon', 'night'],
  12: ['sunrise', 'sunset'],
};

const order = (time: TimeOfDay) => TIMES_OF_DAY.indexOf(time);

/** In day order, without repeats. */
export function sortDoses(doses: readonly TimeOfDay[]): TimeOfDay[] {
  return TIMES_OF_DAY.filter((time) => doses.includes(time));
}

/** The doses the sheet shows: none for "when needed", otherwise in day order. */
export function scheduledDoses(timing: Timing): TimeOfDay[] {
  return timing.mode === 'whenNeeded' ? [] : sortDoses(timing.doses);
}

export const dosesPerDay = (timing: Timing): number => scheduledDoses(timing).length;

/**
 * Tapping a stop on the sky adds or removes that dose. It makes the timing "fixed":
 * after a change by hand, the doses are no longer every N hours. Ignored while the
 * medicine is "when needed", where the stops are faded.
 */
export function toggleDose(timing: Timing, time: TimeOfDay): Timing {
  if (timing.mode === 'whenNeeded') return timing;
  const doses = timing.doses.includes(time)
    ? timing.doses.filter((t) => t !== time)
    : [...timing.doses, time];
  return { ...timing, mode: 'fixed', doses: sortDoses(doses) };
}

/** Dropping the dragged sun on a stop adds a dose there (it never removes one). */
export function addDose(timing: Timing, time: TimeOfDay): Timing {
  if (timing.mode === 'whenNeeded') return timing;
  return { ...timing, mode: 'fixed', doses: sortDoses([...timing.doses, time]) };
}

export function placeTimesADay(timing: Timing, count: TimesADay): Timing {
  return { ...timing, mode: 'fixed', doses: [...TIMES_A_DAY[count]] };
}

export function setEvery(timing: Timing, hours: EveryHours): Timing {
  return { ...timing, mode: 'every', everyHours: hours, doses: [...EVERY[hours]] };
}

/** "Every" places the doses for its interval; the other modes keep the doses as they are. */
export function setMode(timing: Timing, mode: TimingMode): Timing {
  return mode === 'every' ? setEvery(timing, timing.everyHours) : { ...timing, mode };
}

/** Clears the sky. "When needed" stays when needed; otherwise the timing is fixed. */
export function clearDoses(timing: Timing): Timing {
  return { ...timing, mode: timing.mode === 'whenNeeded' ? 'whenNeeded' : 'fixed', doses: [] };
}

export function stepMaxPerDay(timing: Timing, direction: 1 | -1): Timing {
  const maxPerDay = Math.min(
    MAX_PER_DAY.max,
    Math.max(MAX_PER_DAY.min, timing.maxPerDay + direction),
  );
  return { ...timing, maxPerDay };
}

/** Which "times a day" chip is on: only while the doses are exactly that preset. */
export function activeTimesADay(timing: Timing): TimesADay | null {
  if (timing.mode !== 'fixed') return null;
  const doses = sortDoses(timing.doses);
  const counts = [1, 2, 3, 4] as const;
  return (
    counts.find((n) => {
      const preset = TIMES_A_DAY[n];
      return preset.length === doses.length && preset.every((t, i) => t === doses[i]);
    }) ?? null
  );
}

/** The stop closest to an angle on the arc (the sun snaps to it when let go). */
export function nearestTime(angle: number): TimeOfDay {
  let best: TimeOfDay = 'sunrise';
  for (const time of TIMES_OF_DAY) {
    if (Math.abs(TIMES[time].angle - angle) < Math.abs(TIMES[best].angle - angle)) best = time;
  }
  return best;
}

/** The next stop along the day (arrow keys), staying at either end. */
export function stepTime(time: TimeOfDay, direction: 1 | -1): TimeOfDay {
  return TIMES_OF_DAY[order(time) + direction] ?? time;
}

/** How long the sun takes to travel between two angles: longer for longer trips, up to a cap. */
export function sunTravelMs(from: number, to: number): number {
  const { baseMs, msPerDegree, maxMs } = sunArcMotion;
  return Math.min(maxMs, baseMs + Math.abs(to - from) * msPerDegree);
}
