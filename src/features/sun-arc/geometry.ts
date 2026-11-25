/**
 * The Sun Arc's geometry, in the phone design's 390 × 356 stage (SunArc.dc.html).
 * The sun travels a half circle above the horizon and a flatter half ellipse below it.
 */
import { MAX_PER_DAY, TIMES, type TimeOfDay } from '@/domain';
import { sunArcMotion } from '@/styles/tokens';

export const STAGE = { width: 390, height: 356 } as const;

const CENTER = { x: 195, y: 232 } as const;
const RADIUS = { day: 150, night: 80 } as const;

/** The furthest the sun may swing past either end while it settles. */
const LIMIT = { min: -104, max: 186 } as const;

export interface Point {
  x: number;
  y: number;
}

/** Where an angle on the arc sits: 180° the eastern horizon, 90° noon, -90° midnight. */
export function arcPoint(angle: number): Point {
  const r = (angle * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS.day * Math.cos(r),
    y: CENTER.y - (angle >= 0 ? RADIUS.day : RADIUS.night) * Math.sin(r),
  };
}

/** The angle under a point on the stage (the inverse of arcPoint, clamped to the arc). */
export function pointAngle({ x, y }: Point): number {
  const dx = x - CENTER.x;
  const dy = CENTER.y - y;
  let angle: number;
  if (dy >= 0) angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  else {
    angle = (Math.atan2((dy * RADIUS.day) / RADIUS.night, dx) * 180) / Math.PI;
    if (angle < -90) angle = angle < -150 ? 180 : -90;
  }
  return Math.max(-90, Math.min(180, angle));
}

/** Sunrise, midday, sunset and night are the big stops; mid-morning and afternoon are small. */
export const isBigStop = (time: TimeOfDay): boolean =>
  time !== 'midMorning' && time !== 'afternoon';

/** Where the dose pill lands for each stop: inside the arc, 98 from the centre (night: just below). */
export function doseChipCenter(time: TimeOfDay): Point {
  if (time === 'night') return { x: CENTER.x, y: CENTER.y + 28 };
  const r = (TIMES[time].angle * Math.PI) / 180;
  return { x: CENTER.x + 98 * Math.cos(r), y: CENTER.y - 98 * Math.sin(r) };
}

/** "When needed": the most-a-day doses fanned along the inner arc, from 160° to 20°. */
export function whenNeededChips(max: number): Point[] {
  const n = Math.max(MAX_PER_DAY.min, Math.min(MAX_PER_DAY.max, max));
  return Array.from({ length: n }, (_, i) => {
    const angle = n === 1 ? 90 : 160 - (i * 140) / (n - 1);
    const r = (angle * Math.PI) / 180;
    return { x: CENTER.x + 98 * Math.cos(r), y: CENTER.y - 98 * Math.sin(r) };
  });
}

/** The sun's settle: it overshoots a little and swings back (the design's ease). */
export function overshoot(t: number): number {
  const c1 = sunArcMotion.overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export const clampSwing = (angle: number): number =>
  Math.max(LIMIT.min, Math.min(LIMIT.max, angle));

/** Below this the sun has set: it is drawn as the moon. */
export const NIGHT_BELOW = -4;

/** Dose pills placed by a preset fall one after another, 170ms apart. */
export const presetDelay = (i: number): number => 90 + i * 170;

/** How long the sun takes to sweep across a preset's doses. */
export const presetSweepMs = (count: number): number => 90 + (count - 1) * 170 + 260;

/** On first sight, the pills already chosen fall in a little later, 190ms apart. */
export const entryDelay = (i: number): number => 380 + i * 190;
