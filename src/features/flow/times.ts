import { TIMES, type DayPhase, type TimeOfDay } from '@/domain';
/** The pictogram for each time of day (named like the glyphs, with a hyphen). */
export const TIME_GLYPH = {
  sunrise: 'sunrise',
  midMorning: 'mid-morning',
  midday: 'midday',
  afternoon: 'afternoon',
  sunset: 'sunset',
  night: 'night',
} as const satisfies Record<TimeOfDay, string>;

/** The colour token for a time's phase: `phaseColor('night', 'tint')` → `var(--color-night-tint)`. */
export const phaseColor = (phase: DayPhase, shade: 'ink' | 'tint' | 'wash'): string =>
  shade === 'ink' ? `var(--color-${phase})` : `var(--color-${phase}-${shade})`;

export const timeColor = (time: TimeOfDay, shade: 'ink' | 'tint' | 'wash'): string =>
  phaseColor(TIMES[time].phase, shade);

/** The hand-drawn cell corners, rotated by position so tiles never look stamped. */
export const cellRadius = (i: number): string => `var(--radius-cell-${String((i % 4) + 1)})`;
