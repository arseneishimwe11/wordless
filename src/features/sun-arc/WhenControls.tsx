import { ChoiceGroup, SegmentedControl, Stepper } from '@/components';
import { copy } from '@/copy/en';
import {
  activeTimesADay,
  EVERY_HOURS,
  MAX_PER_DAY,
  type EveryHours,
  type Timing,
  type TimesADay,
  type TimingMode,
} from '@/domain';

import styles from './WhenControls.module.css';

const t = copy.screens.when;

export interface WhenControlsProps {
  timing: Timing;
  onMode: (mode: TimingMode) => void;
  onTimesADay: (count: TimesADay) => void;
  onEvery: (hours: EveryHours) => void;
  onMaxPerDay: (direction: 1 | -1) => void;
}

/** How the prescription gives the time: so many a day, every so many hours, or when needed. */
export function WhenControls({
  timing,
  onMode,
  onTimesADay,
  onEvery,
  onMaxPerDay,
}: WhenControlsProps) {
  return (
    <>
      <SegmentedControl
        label={t.modeLabel}
        shape="segment"
        options={[
          { value: 'fixed', label: t.modes.fixed },
          { value: 'every', label: t.modes.every },
          { value: 'whenNeeded', label: t.modes.whenNeeded },
        ]}
        value={timing.mode}
        onChange={onMode}
        className={styles.modes}
      />
      <div className={styles.row}>
        {timing.mode === 'fixed' && (
          <>
            <ChoiceGroup
              label={t.timesLabel}
              chip="number"
              options={([1, 2, 3, 4] as const).map((n) => ({ value: n, label: String(n) }))}
              value={activeTimesADay(timing)}
              onChange={onTimesADay}
              shrink
            />
            <span className={styles.aside}>{t.aDay}</span>
          </>
        )}
        {timing.mode === 'every' && (
          <ChoiceGroup
            label={t.everyLabel}
            chip="text"
            chipWidth={74}
            options={EVERY_HOURS.map((h) => ({
              value: h,
              label: t.hours(h),
              width: h === 12 ? 82 : undefined,
            }))}
            value={timing.everyHours}
            onChange={onEvery}
            shrink
          />
        )}
        {timing.mode === 'whenNeeded' && (
          <>
            <Stepper
              label={t.maxLabel}
              value={timing.maxPerDay}
              min={MAX_PER_DAY.min}
              max={MAX_PER_DAY.max}
              valueWidth={40}
              valueSize={32}
              decreaseLabel={t.fewer}
              increaseLabel={t.more}
              onChange={(value) => {
                onMaxPerDay(value > timing.maxPerDay ? 1 : -1);
              }}
              className={styles.max}
            />
            <span className={styles.aside} aria-hidden="true">
              {t.atMost}
              <br />
              {t.inOneDay}
            </span>
          </>
        )}
      </div>
    </>
  );
}
