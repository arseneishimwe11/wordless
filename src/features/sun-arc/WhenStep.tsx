import { useState } from 'react';

import { Button, Summary } from '@/components';
import { copy } from '@/copy/en';
import {
  EVERY,
  nearestTime,
  quantity,
  scheduledDoses,
  stepTime,
  sunTravelMs,
  TIMES,
  TIMES_A_DAY,
  whenSummary,
  type TimeOfDay,
} from '@/domain';
import { draftStore } from '@/store';

import { HeaderAction, MedicineCard, ScreenLayout, StepHeader, useEntryStep } from '../flow';
import { entryDelay, presetDelay, presetSweepMs } from './geometry';
import { SunArc } from './SunArc';
import { useSun } from './useSun';
import { WhenControls } from './WhenControls';
import styles from './WhenStep.module.css';

const t = copy.screens.when;

const SUNRISE = TIMES.sunrise.angle;

type Delays = Partial<Record<TimeOfDay, number>>;

const delaysFor = (times: readonly TimeOfDay[], delay: (i: number) => number): Delays =>
  Object.fromEntries(times.map((time, i) => [time, delay(i)]));

/** Step 2, the Sun Arc: when each dose goes in. */
export function WhenStep() {
  const step = useEntryStep('when');
  const { medicine } = step;
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
    if (times.length > 1)
      sun.sweep(TIMES[first].angle, TIMES[last].angle, presetSweepMs(times.length));
    else {
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

  const empty = timing.mode !== 'whenNeeded' && doses.length === 0;
  const summary = whenSummary(medicine, copy.domain, { error: step.error });

  return (
    <ScreenLayout
      header={
        <StepHeader
          step={step.number}
          total={step.total}
          label={step.label}
          backLabel={copy.screens.backToMedicine}
          onBack={step.back}
          action={
            <HeaderAction
              onClick={() => {
                draft.clearDoses();
                setDelays({});
                sun.stop();
                sun.travel(SUNRISE);
              }}
            >
              {copy.screens.clear}
            </HeaderAction>
          }
        />
      }
      footer={
        <Button fullWidth pending={empty} iconEnd="arrow" onClick={step.next}>
          {t.next}
        </Button>
      }
    >
      <MedicineCard medicine={medicine} detail={t.perDose(quantity(medicine, copy.domain))} />
      <h1 className={styles.title}>{t.title}</h1>

      <SunArc
        medicine={medicine}
        sun={sun}
        delays={delays}
        showHint={!touched}
        nudge={step.error ? step.attempts : 0}
        onStop={(time) => {
          if (timing.mode === 'whenNeeded') return;
          goTo(time, 0.62, !doses.includes(time));
          draft.toggleDose(time);
        }}
        onSunDrop={(time) => {
          goTo(time, 0.55, !doses.includes(time));
          draft.addDose(time);
        }}
        onSunStep={(direction) => {
          goTo(stepTime(nearestTime(sun.heading()), direction), 0, false);
        }}
        onTouch={() => {
          setTouched(true);
        }}
      />

      <WhenControls
        timing={timing}
        onMode={(mode) => {
          if (mode === 'every') place(EVERY[timing.everyHours]);
          if (mode === 'whenNeeded') sun.stop();
          draft.setMode(mode);
          setTouched(true);
        }}
        onTimesADay={(count) => {
          place(TIMES_A_DAY[count]);
          draft.placeTimesADay(count);
        }}
        onEvery={(hours) => {
          place(EVERY[hours]);
          draft.setEvery(hours);
        }}
        onMaxPerDay={draft.stepMaxPerDay}
      />

      <Summary
        title={summary.title}
        detail={summary.detail}
        tone={summary.tone === 'error' ? 'error' : 'default'}
        className={styles.summary}
      />
    </ScreenLayout>
  );
}
