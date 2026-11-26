/**
 * The Sun Arc's geometry, in the phone design's 390 × 356 stage (SunArc.dc.html).
 * The sun travels a half circle above the horizon and a flatter half ellipse below it.
 */
import { MAX_PER_DAY, TIMES, type TimeOfDay } from '@/domain';
import { sunArcMotion } from '@/styles/tokens';

export type ArcSize = 'phone' | 'desktop';

/** Everything that differs between the phone arc (SunArc.dc.html) and the desktop one (DesktopEntry.dc.html). */
export interface ArcGeometry {
  width: number;
  height: number;
  center: { x: number; y: number };
  radius: { day: number; night: number };
  /** Dose pills sit on an inner arc this far from the centre; the night pill just below it. */
  chipRadius: number;
  nightChipY: number;
  chip: number;
  chipPill: { capsule: number; other: number };
  stop: { big: number; small: number };
  stopGlyph: { big: number; small: number };
  /** The sky behind the arc. */
  sky: { left: number; top: number; width: number; height: number };
  count: { left: number; top: number; width: number; height: number };
  hand: { left: number; top: number; size: number };
  labels: {
    midday: [number, number];
    sunrise: [number, number];
    sunset: [number, number];
    night: [number, number];
  };
}

export const ARCS: Record<ArcSize, ArcGeometry> = {
  phone: {
    width: 390,
    height: 356,
    center: { x: 195, y: 232 },
    radius: { day: 150, night: 80 },
    chipRadius: 98,
    nightChipY: 260,
    chip: 42,
    chipPill: { capsule: 34, other: 30 },
    stop: { big: 56, small: 44 },
    stopGlyph: { big: 40, small: 30 },
    sky: { left: 10, top: 40, width: 370, height: 192 },
    count: { left: 125, top: 172, width: 140, height: 58 },
    hand: { left: 172, top: 288, size: 46 },
    labels: { midday: [228, 66], sunrise: [20, 252], sunset: [304, 252], night: [232, 302] },
  },
  desktop: {
    width: 520,
    height: 410,
    center: { x: 260, y: 250 },
    radius: { day: 210, night: 104 },
    chipRadius: 132,
    nightChipY: 284,
    chip: 56,
    chipPill: { capsule: 44, other: 40 },
    stop: { big: 72, small: 56 },
    stopGlyph: { big: 54, small: 38 },
    sky: { left: 12, top: 2, width: 496, height: 248 },
    count: { left: 194, top: 166, width: 132, height: 80 },
    hand: { left: 230, top: 324, size: 60 },
    labels: { midday: [306, 28], sunrise: [40, 270], sunset: [420, 270], night: [306, 342] },
  },
};

/** The phone stage, for code that only ever draws the phone arc. */
export const STAGE = { width: ARCS.phone.width, height: ARCS.phone.height } as const;

/** The furthest the sun may swing past either end while it settles. */
const LIMIT = { min: -104, max: 186 } as const;

export interface Point {
  x: number;
  y: number;
}

/** Where an angle on the arc sits: 180° the eastern horizon, 90° noon, -90° midnight. */
export function arcPoint(angle: number, g: ArcGeometry = ARCS.phone): Point {
  const r = (angle * Math.PI) / 180;
  return {
    x: g.center.x + g.radius.day * Math.cos(r),
    y: g.center.y - (angle >= 0 ? g.radius.day : g.radius.night) * Math.sin(r),
  };
}

/** The angle under a point on the stage (the inverse of arcPoint, clamped to the arc). */
export function pointAngle({ x, y }: Point, g: ArcGeometry = ARCS.phone): number {
  const dx = x - g.center.x;
  const dy = g.center.y - y;
  let angle: number;
  if (dy >= 0) angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  else {
    angle = (Math.atan2((dy * g.radius.day) / g.radius.night, dx) * 180) / Math.PI;
    if (angle < -90) angle = angle < -150 ? 180 : -90;
  }
  return Math.max(-90, Math.min(180, angle));
}

/** Sunrise, midday, sunset and night are the big stops; mid-morning and afternoon are small. */
export const isBigStop = (time: TimeOfDay): boolean =>
  time !== 'midMorning' && time !== 'afternoon';

/** Where the dose pill lands for each stop: on the inner arc (night: just below the horizon). */
export function doseChipCenter(time: TimeOfDay, g: ArcGeometry = ARCS.phone): Point {
  if (time === 'night') return { x: g.center.x, y: g.nightChipY };
  const r = (TIMES[time].angle * Math.PI) / 180;
  return { x: g.center.x + g.chipRadius * Math.cos(r), y: g.center.y - g.chipRadius * Math.sin(r) };
}

/** "When needed": the most-a-day doses fanned along the inner arc, from 160° to 20°. */
export function whenNeededChips(max: number, g: ArcGeometry = ARCS.phone): Point[] {
  const n = Math.max(MAX_PER_DAY.min, Math.min(MAX_PER_DAY.max, max));
  return Array.from({ length: n }, (_, i) => {
    const angle = n === 1 ? 90 : 160 - (i * 140) / (n - 1);
    const r = (angle * Math.PI) / 180;
    return {
      x: g.center.x + g.chipRadius * Math.cos(r),
      y: g.center.y - g.chipRadius * Math.sin(r),
    };
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
