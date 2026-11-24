import type { SlotValues } from './types';
import type { PatternName } from './generated/patterns';

/**
 * The Pill Builder's ten colours. Each is always paired with its own pattern, so
 * two medicines are never told apart by colour alone, even in black and white.
 */
export const PILL_COLORS = [
  'white',
  'yellow',
  'orange',
  'pink',
  'red',
  'brown',
  'green',
  'blue',
  'purple',
  'dark',
] as const;

export type PillColor = (typeof PILL_COLORS)[number];

export const PILL_PATTERN: Record<PillColor, PatternName | null> = {
  white: null,
  yellow: 'dots',
  orange: 'diag',
  pink: 'rings',
  red: 'cross',
  brown: 'horiz',
  green: 'check',
  blue: 'zig',
  purple: 'back',
  dark: 'vert',
};

const fill = (c: PillColor) => `var(--color-pill-${c})`;
const pattern = (c: PillColor) => {
  const name = PILL_PATTERN[c];
  return name ? `url(#wl-p-${name})` : 'none';
};

/** Slot values for a pill drawing. `color2` is a capsule's body; it defaults to `color`. */
export function pillSlots(color: PillColor, color2: PillColor = color, score = false): SlotValues {
  return {
    base: fill(color),
    pattern: pattern(color),
    base2: fill(color2),
    pattern2: pattern(color2),
    score: score ? '1' : '0',
  };
}
