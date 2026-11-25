/**
 * The Pill Builder's ten colours. Each is always drawn with its own pattern (see
 * graphics/pillColors.ts), so two medicines are never told apart by colour alone,
 * even in black and white.
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
