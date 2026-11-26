import type { CSSProperties } from 'react';

import { Animated } from '@/components';
import { copy } from '@/copy/en';
import {
  keyUnit,
  nearestTime,
  scheduledDoses,
  TIMES,
  TIMES_OF_DAY,
  whenCount,
  type Medicine,
  type TimeOfDay,
} from '@/domain';
import { Glyph, Graphic, Illustration, PillUnit } from '@/graphics';
import { glyphs } from '@/graphics/generated/glyphs';
import { hintArrow } from '@/graphics/generated/illustrations/hint-arrow';
import { sunArcBands } from '@/graphics/generated/illustrations/sun-arc-bands';
import { sunArcDesktop } from '@/graphics/generated/illustrations/sun-arc-desktop';
import { sunArcDesktopPrn } from '@/graphics/generated/illustrations/sun-arc-desktop-prn';
import { sunArcGround } from '@/graphics/generated/illustrations/sun-arc-ground';
import { sunArcPrn } from '@/graphics/generated/illustrations/sun-arc-prn';
import { cx } from '@/lib/cx';

import { DashedDose } from '../household/DashedDose';
import { phaseColor, ScaledStage, TIME_GLYPH } from '../flow';
import {
  ARCS,
  arcPoint,
  doseChipCenter,
  isBigStop,
  whenNeededChips,
  type ArcSize,
} from './geometry';
import { Sun } from './Sun';
import styles from './SunArc.module.css';
import type { SunMotion } from './useSun';

const t = copy.screens.when;

/** The small stops are a dot in the colour of their time (mid-morning saffron, afternoon coral). */
const smallDot = (time: TimeOfDay) =>
  JSON.parse(
    JSON.stringify(glyphs['sun-small']).replaceAll('"c:sunrise"', `"c:${TIMES[time].phase}"`),
  ) as (typeof glyphs)['sun-small'];

const DOTS = { midMorning: smallDot('midMorning'), afternoon: smallDot('afternoon') };

/** The design rotates the stops' hand-drawn corners. */
const STOP_SHAPE: Record<TimeOfDay, string> = {
  sunrise: 'var(--radius-chip-3)',
  midMorning: 'var(--radius-chip-2)',
  midday: 'var(--radius-chip-1)',
  afternoon: 'var(--radius-chip-3)',
  sunset: 'var(--radius-chip-2)',
  night: 'var(--radius-chip-1)',
};

/** The sky behind a stop: each time's tint, but the deeper night sky at night. */
const skyOf = (time: TimeOfDay) =>
  TIMES[time].phase === 'night' ? 'var(--color-night-sky)' : phaseColor(TIMES[time].phase, 'tint');

/** The offset shadow under a dose pill: the time's ink, or the night tint. */
const doseShadow = (time: TimeOfDay) =>
  TIMES[time].phase === 'night' ? 'var(--color-night-tint)' : phaseColor(TIMES[time].phase, 'ink');

const LABELS = [
  { time: 'midday', onNight: false },
  { time: 'sunrise', onNight: true },
  { time: 'sunset', onNight: true },
  { time: 'night', onNight: true },
] as const;

export interface SunArcProps {
  medicine: Medicine;
  sun: SunMotion;
  /** When each dose pill starts to fall, in ms. */
  delays: Partial<Record<TimeOfDay, number>>;
  showHint: boolean;
  /** Counts the blocked presses of Next, to nudge the sun. */
  nudge: number;
  onStop: (time: TimeOfDay) => void;
  onSunDrop: (time: TimeOfDay) => void;
  onSunStep: (direction: 1 | -1) => void;
  onTouch: () => void;
  /** The phone arc (390 × 356, scaled to the screen) or the desktop one (520 × 410). */
  size?: ArcSize | undefined;
}

/**
 * When does it go in? The day as an arc: tap a stop on the sky, or drag the sun, and a
 * dose pill drops in under it. "When needed" fades the sky and fans out the most a day.
 */
export function SunArc({
  medicine,
  sun,
  delays,
  showHint,
  nudge,
  onStop,
  onSunDrop,
  onSunStep,
  onTouch,
  size = 'phone',
}: SunArcProps) {
  const g = ARCS[size];
  const desktop = size === 'desktop';
  const whenNeeded = medicine.timing.mode === 'whenNeeded';
  const doses = scheduledDoses(medicine.timing);
  const near = nearestTime(sun.angle);
  const unit = keyUnit(medicine);
  const pillSize = unit === 'capsule' ? g.chipPill.capsule : g.chipPill.other;
  const count = whenCount(medicine, copy.domain);
  const bigSize = whenNeeded
    ? 'sizeSmall'
    : medicine.timing.mode === 'every' && doses.length
      ? 'sizeMedium'
      : 'sizeLarge';

  const arc = (
    <div data-arc="" className={cx(styles.arc, desktop && styles.desktop)}>
      <div
        aria-hidden="true"
        className={styles.sky}
        style={{
          ...g.sky,
          background: whenNeeded ? 'var(--color-prn-sky)' : skyOf(near),
        }}
      />
      <Illustration
        data={desktop ? sunArcDesktop : sunArcGround}
        width={g.width}
        className={styles.layer}
      />
      {!desktop && (
        <div aria-hidden="true" className={cx(styles.layer, whenNeeded && styles.muted)}>
          <Illustration data={sunArcBands} width={g.width} />
        </div>
      )}
      {whenNeeded && (
        <Illustration
          data={desktop ? sunArcDesktopPrn : sunArcPrn}
          width={g.width}
          className={styles.layer}
        />
      )}
      {LABELS.map((label) => {
        const [left, top] = g.labels[label.time];
        return (
          <span
            key={label.time}
            aria-hidden="true"
            className={cx(styles.label, label.onNight && styles.onNight)}
            style={{ left, top }}
          >
            {copy.domain.times[label.time].name}
          </span>
        );
      })}

      <div className={cx(styles.stops, whenNeeded && styles.faint)}>
        {TIMES_OF_DAY.map((time) => {
          const { x, y } = arcPoint(TIMES[time].angle, g);
          const big = isBigStop(time);
          const stop = big ? g.stop.big : g.stop.small;
          const on = doses.includes(time);
          const name = copy.domain.times[time];
          const ring = desktop
            ? `var(--shadow-ring-stop-halo-lg) ${skyOf(time)}, var(--shadow-ring-stop-edge-lg)`
            : `var(--shadow-ring-stop-halo) ${skyOf(time)}, var(--shadow-ring-stop-edge)`;
          return (
            <button
              key={time}
              type="button"
              aria-label={t.stop(copy.domain.capitalize(name.name), name.at)}
              aria-pressed={on}
              disabled={whenNeeded}
              className={styles.stop}
              style={{
                left: x - stop / 2,
                top: y - stop / 2,
                width: stop,
                height: stop,
                borderRadius: STOP_SHAPE[time],
                // A halo in the stop's own tint, then an ink ring (tokens hold the geometry).
                boxShadow: on ? ring : 'none',
              }}
              onClick={() => {
                onStop(time);
              }}
            >
              {big ? (
                <Glyph name={TIME_GLYPH[time]} size={g.stopGlyph.big} />
              ) : (
                <Graphic
                  data={DOTS[time as 'midMorning' | 'afternoon']}
                  width={g.stopGlyph.small}
                  height={g.stopGlyph.small}
                />
              )}
            </button>
          );
        })}
      </div>

      {!whenNeeded &&
        doses.map((time) => {
          const c = doseChipCenter(time, g);
          return (
            <div
              key={time}
              className={styles.dose}
              style={{
                left: c.x - g.chip / 2,
                top: c.y - g.chip / 2,
                width: g.chip,
                height: g.chip,
              }}
            >
              <Animated effect="drop" delay={delays[time] ?? 0}>
                <span
                  className={styles.doseFace}
                  style={{ '--dose-color': doseShadow(time) } as CSSProperties}
                >
                  <PillUnit
                    kind={unit}
                    color={medicine.color}
                    color2={medicine.color2}
                    score={medicine.score}
                    size={pillSize}
                  />
                </span>
              </Animated>
            </div>
          );
        })}

      {whenNeeded && (
        <>
          {whenNeededChips(medicine.timing.maxPerDay, g).map((c, i) => (
            <div
              key={i}
              className={styles.dose}
              style={{
                left: c.x - g.chip / 2,
                top: c.y - g.chip / 2,
                width: g.chip,
                height: g.chip,
              }}
            >
              <Animated effect="drop" delay={i * 90}>
                <DashedDose medicine={medicine} unit={unit} size={desktop ? 56 : 42} />
              </Animated>
            </div>
          ))}
          <div className={styles.hand} style={{ left: g.hand.left, top: g.hand.top }}>
            <Animated effect="fade">
              <Glyph name="no-more" size={g.hand.size} label={t.noMore} />
            </Animated>
          </div>
        </>
      )}

      <div aria-live="polite" className={styles.count} style={g.count}>
        <span className={cx(styles.big, styles[bigSize])}>{count.big}</span>{' '}
        <span className={styles.small}>{count.small}</span>
      </div>

      {!whenNeeded && (
        <Sun
          sun={sun}
          geometry={g}
          label={t.sun(copy.domain.times[near].name, doses.includes(near))}
          nudge={nudge}
          onDrop={onSunDrop}
          onPress={onStop}
          onStep={onSunStep}
          onTouch={onTouch}
        />
      )}

      {showHint && !desktop && (
        <div aria-hidden="true" className={styles.hint}>
          <span className={styles.hintText}>{t.hint}</span>
          <Illustration data={hintArrow} width={60} className={styles.hintArrow} />
        </div>
      )}
    </div>
  );

  // The desktop arc keeps its size and scrolls in its own box if ever too narrow.
  if (desktop) {
    return (
      <div className={styles.desktopStage}>
        <div style={{ position: 'relative', width: g.width, height: g.height }}>{arc}</div>
      </div>
    );
  }
  return (
    <ScaledStage width={g.width} height={g.height} bleed className={styles.stage}>
      {arc}
    </ScaledStage>
  );
}
