import { useState } from 'react';

import {
  EVERY,
  nearestTime,
  scheduledDoses,
  stepTime,
  sunTravelMs,
  TIMES,
  TIMES_A_DAY,
  type EveryHours,
  type Medicine,
  type TimeOfDay,
  type TimesADay,
  type TimingMode,
} from '@/domain';
import { draftStore } from '@/store';

import { entryDelay, presetDelay, presetSweepMs } from './geometry';
import { useSun, type SunMotion } from './useSun';

const SUNRISE = TIMES.sunrise.angle;

export type Delays = Partial<Record<TimeOfDay, number>>;

const delaysFor = (times: readonly TimeOfDay[], delay: (i: number) => number): Delays =>
  Object.fromEntries(times.map((time, i) => [time, delay(i)]));

export interface WhenControls {
  sun: SunMotion;
  delays: Delays;
  touched: boolean;
  setTouched: () => void;
  onStop: (time: TimeOfDay) => void;
  onSunDrop: (time: TimeOfDay) => void;
  onSunStep: (direction: 1 | -1) => void;
  onMode: (mode: TimingMode) => void;
  onTimesADay: (count: TimesADay) => void;
  onEvery: (hours: EveryHours) => void;
  onMaxPerDay: (direction: 1 | -1) => void;
  clear: () => void;
}

/**
 * Everything the When step does, for the phone and desktop layouts alike: the sun's
 * motion, when each dose pill drops, and the changes to the medicine being entered.
 */
export function useWhen(medicine: Medicine): WhenControls {
  const { timing } = medicine;
  const doses = scheduledDoses(timing);
  const draft = draftStore.getState();

  // On arrival the sun waits at the middle dose (or at sunrise), and the pills drop in.
  const [arrival] = useState(() => ({
    angle: doses.length
      ? TIMES[doses[Math.floor((doses.length - 1) / 2)] ?? 'sunrise'].angle
      : SUNRISE,
    delays: delaysFor(doses, entryDelay),
    touched: doses.length > 0 || timing.mode === 'whenNeeded',
  }));
  const sun = useSun(arrival.angle);
  const [delays, setDelays] = useState<Delays>(arrival.delays);
  const [touched, setTouched] = useState(arrival.touched);

  /** A preset lays its doses out in turn while the sun sweeps across them. */
  const place = (times: readonly TimeOfDay[]) => {
    setTouched(true);
    setDelays(delaysFor(times, presetDelay));
    const first = times[0];
    const last = times.at(-1);
    if (!first || !last) return;
    if (times.length > 1) {
      sun.sweep(TIMES[first].angle, TIMES[last].angle, presetSweepMs(times.length));
    } else {
      sun.stop();
      sun.set(TIMES[first].angle);
    }
  };

  /** The pill lands as the sun arrives (a little after it sets off). */
  const goTo = (time: TimeOfDay, share: number, add: boolean) => {
    const ms = sunTravelMs(sun.current(), TIMES[time].angle);
    if (add) setDelays((d) => ({ ...d, [time]: Math.round(ms * share) }));
    sun.travel(TIMES[time].angle, ms);
    setTouched(true);
  };

  return {
    sun,
    delays,
    touched,
    setTouched: () => {
      setTouched(true);
    },
    onStop: (time) => {
      if (timing.mode === 'whenNeeded') return;
      goTo(time, 0.62, !doses.includes(time));
      draft.toggleDose(time);
    },
    onSunDrop: (time) => {
      goTo(time, 0.55, !doses.includes(time));
      draft.addDose(time);
    },
    onSunStep: (direction) => {
      goTo(stepTime(nearestTime(sun.heading()), direction), 0, false);
    },
    onMode: (mode) => {
      if (mode === 'every') place(EVERY[timing.everyHours]);
      if (mode === 'whenNeeded') sun.stop();
      draft.setMode(mode);
      setTouched(true);
    },
    onTimesADay: (count) => {
      place(TIMES_A_DAY[count]);
      draft.placeTimesADay(count);
    },
    onEvery: (hours) => {
      place(EVERY[hours]);
      draft.setEvery(hours);
    },
    onMaxPerDay: draft.stepMaxPerDay,
    clear: () => {
      draft.clearDoses();
      setDelays({});
      sun.stop();
      sun.travel(SUNRISE);
    },
  };
}
