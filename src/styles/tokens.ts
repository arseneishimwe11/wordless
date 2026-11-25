/**
 * Wordless design tokens: the single source of truth for every visual value.
 *
 * Values are taken exactly from the design (design/source/*.dc.html). Sizes keep
 * their design numbers in their names (`text.17`, `space.14`, `display.26`) so a
 * value in the design maps to exactly one token.
 *
 * `scripts/build-tokens.ts` turns this file into `tokens.css` (CSS custom
 * properties named `--{group}-{key}`). Never edit tokens.css by hand: edit this
 * file and run `npm run tokens`.
 */

/** Headings, numbers and the wordmark are drawn at 92% of their authored size. */
export const DISPLAY_SCALE = 0.92;

const px = (n: number) => `${String(n)}px`;
const scaled = (n: number) => px(Math.round(n * DISPLAY_SCALE * 100) / 100);

const record = <const K extends number, V>(keys: readonly K[], value: (k: K) => V) =>
  Object.fromEntries(keys.map((k) => [String(k), value(k)])) as Record<`${K}`, V>;

export const color = {
  // Paper and ink
  paper: '#F6EEDD',
  'paper-deep': '#EEE2C6',
  rule: '#D9C7A2',
  surface: '#FBF6EA',
  ink: '#1F1C33',
  'ink-soft': '#5A5368',
  pen: '#3B3A8C',
  white: '#FFFFFF',

  // The printed sheet
  sheet: '#FFFDF8',
  'sheet-cell': '#FBF7EE',
  'sheet-tally': '#F7F1E4',
  veil: 'rgba(255, 255, 255, 0.82)',
  'veil-strong': 'rgba(255, 255, 255, 0.85)',

  // Time of day: ink (the sun), tint (sky and headers), wash (sheet cells)
  sunrise: '#F2A516',
  'sunrise-tint': '#FBE3A0',
  'sunrise-wash': '#FDF3D6',
  midday: '#EE7A5B',
  'midday-tint': '#F9CDBC',
  'midday-wash': '#FDEAE2',
  sunset: '#B4502E',
  'sunset-tint': '#EDB9A0',
  'sunset-wash': '#F9E6DC',
  night: '#2E2C6B',
  'night-tint': '#CDCAEB',
  'night-wash': '#ECEBF7',
  'night-sky': '#DEDBF1',
  'on-night': '#E4E1F4',
  'prn-sky': '#EFE6D2',

  // States
  error: '#A4492A',
  'error-wash': '#F9E6DC',
  focus: '#3B3A8C',

  // Pill colors (each one is always paired with a pattern; see graphics/)
  'pill-white': '#FFFFFF',
  'pill-yellow': '#F7D046',
  'pill-orange': '#F39A33',
  'pill-pink': '#F3A9BC',
  'pill-red': '#CF4630',
  'pill-brown': '#8E5B3B',
  'pill-green': '#86AD5C',
  'pill-blue': '#7193CF',
  'pill-purple': '#8F6BB8',
  'pill-dark': '#3A3540',

  // Illustration-only shades
  'illo-box-top': '#F3E9D2',
  'illo-box-side': '#E3D3B1',
  'illo-coral-shade': '#D9694C',
  'illo-pen-shade': '#2A2960',
  'illo-slot': '#3A3655',
} as const;

export const font = {
  display: "'Young Serif', Georgia, serif",
  body: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif",
  hand: "'Kalam', 'Comic Sans MS', cursive",
} as const;

export const weight = { regular: '400', bold: '700' } as const;

/** Young Serif sizes, keyed by the size authored in the design (rendered at ×0.92). */
export const display = record(
  [
    14, 15, 16, 17, 19, 20, 22, 24, 26, 27, 28, 30, 31, 32, 34, 36, 38, 40, 44, 50, 54, 56, 60, 64,
    150,
  ],
  scaled,
);

/** Every other font size, in px exactly as designed (includes the unscaled landing headings). */
export const text = record(
  [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 30, 34, 44, 52, 64, 76],
  px,
);

/**
 * Line heights. `normal` is the font's own line height and the design's default:
 * the boards set no global line height. Others are unitless, keyed ×100 (`130` = 1.3).
 */
export const leading = {
  normal: 'normal',
  '86': '0.86',
  '100': '1',
  '102': '1.02',
  '104': '1.04',
  '105': '1.05',
  '106': '1.06',
  '108': '1.08',
  '110': '1.1',
  '115': '1.15',
  '120': '1.2',
  '125': '1.25',
  '130': '1.3',
  '135': '1.35',
  '140': '1.4',
  '145': '1.45',
  '150': '1.5',
} as const;

export const tracking = {
  display: '-0.01em',
  caps: '0.1em',
  eyebrow: '0.12em',
  'eyebrow-wide': '0.14em',
} as const;

export const space = record(
  [
    2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 52, 56, 64,
    72, 88, 96,
  ],
  px,
);

/** Line weights. `ink` is the pen stroke of every pictogram. */
export const stroke = {
  hair: '1.5px',
  cut: '1.6px',
  kbd: '1.8px',
  thin: '2px',
  dash: '2.2px',
  desk: '2.4px',
  base: '2.5px',
  ink: '2.6px',
  heavy: '3px',
} as const;

/**
 * Hand-drawn corner shapes. Numbered families (`cell-1…4`, `sheet-1…4`, `chip-1…3`, `box-1…3`)
 * are rotated by index so repeated tiles never look stamped from one mould.
 */
export const radius = {
  round: '50%',
  control: '20px 16px 19px 15px / 16px 20px 15px 19px',
  card: '22px 18px 21px 17px / 18px 22px 17px 21px',
  panel: '28px 22px 26px 20px / 22px 28px 20px 26px',
  feature: '26px 20px 24px 18px / 20px 26px 18px 24px',
  segment: '26px 22px 25px 23px / 23px 26px 22px 25px',
  'chip-1': '29px 27px 30px 26px / 26px 29px 27px 30px',
  'chip-2': '27px 30px 26px 29px / 30px 26px 29px 27px',
  'chip-3': '30px 26px 29px 27px / 27px 30px 26px 29px',
  sun: '23px 21px 22px 20px / 21px 23px 20px 22px',
  'sun-lg': '30px 28px 29px 27px / 28px 30px 27px 29px',
  'cell-1': '12px 9px 11px 8px / 9px 12px 8px 11px',
  'cell-2': '9px 12px 8px 11px / 12px 8px 11px 9px',
  'cell-3': '11px 8px 12px 9px / 8px 11px 9px 12px',
  'cell-4': '8px 11px 9px 12px / 11px 9px 12px 8px',
  'sheet-1': '14px 11px 13px 10px / 11px 14px 10px 13px',
  'sheet-2': '11px 14px 10px 13px / 14px 10px 13px 11px',
  'sheet-3': '13px 10px 14px 11px / 10px 13px 11px 14px',
  'sheet-4': '10px 13px 11px 14px / 13px 11px 14px 10px',
  outline: '24px 20px 23px 19px / 20px 24px 19px 23px',
  'box-1': '8px 6px 7px 5px / 6px 8px 5px 7px',
  'box-2': '6px 8px 5px 7px / 8px 5px 7px 6px',
  'box-3': '7px 5px 8px 6px / 5px 7px 6px 8px',
  tick: '7px 5px 6px 4px / 5px 7px 4px 6px',
  'swatch-1': '14px 18px 12px 16px / 16px 12px 18px 14px',
  'swatch-2': '18px 12px 16px 14px / 12px 18px 14px 16px',
  'swatch-3': '12px 16px 18px 14px / 18px 14px 12px 16px',
  'swatch-chip': '7px 5px 8px 6px',
  tile: '10px 14px 9px 12px / 12px 9px 14px 10px',
  progress: '6px 5px 6px 5px',
  kbd: '7px 6px 7px 5px',
  /** The Sun Arc's day sky: a half circle on the horizon. */
  sky: '185px 185px 0 0',
  phone: '34px',
  'phone-sm': '26px',
  tag: '18px',
  '12': '12px',
  '10': '10px',
  '6': '6px',
  '3': '3px',
  '2': '2px',
} as const;

/** Hard, unblurred offset shadows and rings, like a two-colour screen print. */
export const shadow = {
  cta: '4px 4px 0 var(--color-sunrise)',
  'cta-sm': '3px 3px 0 var(--color-sunrise)',
  pressed: '4px 4px 0 var(--color-ink)',
  'pressed-sm': '3px 3px 0 var(--color-ink)',
  /**
   * Geometry only: the colour comes from the time of day, so components add it, e.g.
   * `box-shadow: var(--shadow-dose-offset) var(--dose-color)`. (A token can't hold a
   * per-element variable: custom properties resolve where they are defined, on :root.)
   */
  'dose-offset': '3px 3px 0',
  'dose-offset-lg': '4px 4px 0',
  qr: '4px 4px 0 var(--color-sunrise-tint)',
  badge: '8px 8px 0 var(--color-night-tint)',
  'frame-phone': '0 0 0 2.5px var(--color-ink), 9px 10px 0 2.5px var(--color-rule)',
  'frame-phone-sm': '0 0 0 2.5px var(--color-ink), 8px 9px 0 2.5px var(--color-rule)',
  'frame-sheet': '0 0 0 2px var(--color-ink), 10px 11px 0 2px var(--color-rule)',
  'frame-preview': '0 0 0 2px var(--color-ink), 9px 10px 0 2px var(--color-rule)',
  'outline-ink': '0 0 0 2px var(--color-ink)',
  'outline-pen': '0 0 0 2px var(--color-pen)',
  'outline-hair': '0 0 0 1.5px var(--color-ink)',
  'ring-swatch': '0 0 0 3px var(--color-paper), 0 0 0 6px var(--color-ink)',
  'ring-swatch-surface': '0 0 0 3px var(--color-surface), 0 0 0 6px var(--color-ink)',
  /**
   * Sun Arc time stops: a halo in the stop's own tint, then an ink ring. Components write
   * `box-shadow: var(--shadow-ring-stop-halo) var(--stop-tint), var(--shadow-ring-stop-edge)`.
   */
  'ring-stop-halo': '0 0 0 5px',
  'ring-stop-edge': '0 0 0 7.5px var(--color-ink)',
  'ring-stop-halo-lg': '0 0 0 6px',
  'ring-stop-edge-lg': '0 0 0 9px var(--color-ink)',
} as const;

export const duration = {
  // transitions
  hover: '0.15s',
  fast: '0.2s',
  base: '0.25s',
  medium: '0.3s',
  slow: '0.4s',
  slower: '0.5s',
  // animations
  pop: '0.38s',
  stamp: '0.5s',
  nudge: '0.55s',
  'drop-unit': '0.66s',
  drop: '0.7s',
  fade: '0.4s',
  print: '1.25s',
  spin: '40s',
} as const;

export const ease = {
  standard: 'ease',
  linear: 'linear',
  drop: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
  stamp: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
  print: 'cubic-bezier(0.45, 0.05, 0.3, 1)',
} as const;

export const opacity = {
  grain: '0.5',
  'grain-soft': '0.45',
  ghost: '0.45',
  half: '0.5',
  muted: '0.35',
  faint: '0.3',
} as const;

export const layer = {
  raised: '2',
  overlay: '3',
  handle: '5',
  grain: '100',
} as const;

/** Groups emitted as CSS custom properties, in output order. */
export const cssTokens = {
  color,
  font,
  weight,
  display,
  text,
  leading,
  tracking,
  space,
  stroke,
  radius,
  shadow,
  duration,
  ease,
  opacity,
  layer,
} as const;

// ---- TypeScript-only values (not emitted as CSS) ---------------------------------------

/** Media and container query thresholds. CSS custom properties can't be used in queries. */
export const breakpoint = {
  /** Split-view desktop layout from this width; phone flow below. */
  desktop: 1024,
  /** Landing page container widths. */
  landingCompact: 760,
  landingNarrow: 389,
  /** Below this, the Pill Builder's six forms sit in two columns instead of three. */
  phoneNarrow: 380,
} as const;

/** The Sun Arc's animation: easeOutBack, duration grows with the angle travelled. */
export const sunArcMotion = {
  overshoot: 1.25,
  baseMs: 320,
  msPerDegree: 2.6,
  maxMs: 950,
} as const;

/** How the four time inks print on a black and white printer (documentation only). */
export const greyEquivalent = {
  sunrise: { ink: '33%', swatch: '#ABABAB' },
  midday: { ink: '43%', swatch: '#909090' },
  sunset: { ink: '61%', swatch: '#636363' },
  night: { ink: '81%', swatch: '#313131' },
} as const;

export type ColorToken = keyof typeof color;

/** A text colour on a background, as the design uses it, with the WCAG level it must meet. */
export interface TextPair {
  fg: ColorToken;
  bg: ColorToken;
  /** 'normal' needs 4.5:1; 'large' (≥ 24px, or ≥ 18.66px bold) needs 3:1. */
  size: 'normal' | 'large';
  where: string;
}

export const textPairs: readonly TextPair[] = [
  { fg: 'ink', bg: 'paper', size: 'normal', where: 'all body text' },
  { fg: 'ink', bg: 'paper-deep', size: 'normal', where: 'wells, medicine summary card' },
  { fg: 'ink', bg: 'surface', size: 'normal', where: 'buttons, cards, inputs' },
  { fg: 'ink', bg: 'sheet', size: 'normal', where: 'printed sheet' },
  { fg: 'ink', bg: 'white', size: 'normal', where: 'black and white print' },
  { fg: 'ink', bg: 'sunrise', size: 'normal', where: 'selected number chip' },
  { fg: 'ink', bg: 'sunrise-tint', size: 'normal', where: 'selected card, current step' },
  { fg: 'ink', bg: 'sunrise-wash', size: 'normal', where: 'added banner' },
  { fg: 'ink', bg: 'error-wash', size: 'normal', where: 'input in error' },
  { fg: 'ink-soft', bg: 'paper', size: 'normal', where: 'secondary text' },
  { fg: 'ink-soft', bg: 'paper-deep', size: 'normal', where: 'medicine summary card' },
  { fg: 'ink-soft', bg: 'surface', size: 'normal', where: 'card subtitles' },
  { fg: 'ink-soft', bg: 'sheet', size: 'normal', where: 'sheet captions' },
  { fg: 'ink-soft', bg: 'sunrise-tint', size: 'normal', where: 'current step summary' },
  { fg: 'pen', bg: 'paper', size: 'normal', where: 'handwritten hints, links' },
  { fg: 'pen', bg: 'paper-deep', size: 'normal', where: 'hints in wells' },
  { fg: 'pen', bg: 'surface', size: 'normal', where: 'hints in cards, Clear' },
  { fg: 'pen', bg: 'sheet', size: 'normal', where: 'live sheet notes' },
  { fg: 'pen', bg: 'sunrise-tint', size: 'normal', where: 'sky label at sunrise' },
  { fg: 'pen', bg: 'midday-tint', size: 'normal', where: 'sky label at midday' },
  { fg: 'pen', bg: 'night-sky', size: 'normal', where: 'sky label at night' },
  { fg: 'pen', bg: 'prn-sky', size: 'normal', where: 'sky label, when needed' },
  { fg: 'paper', bg: 'ink', size: 'normal', where: 'primary button, selected segment' },
  { fg: 'paper', bg: 'night', size: 'normal', where: 'sky labels below the horizon' },
  { fg: 'on-night', bg: 'night', size: 'normal', where: 'landing safety section' },
  { fg: 'night-tint', bg: 'night', size: 'normal', where: 'landing safety eyebrow' },
  { fg: 'white', bg: 'pen', size: 'normal', where: 'numbered callouts' },
  { fg: 'error', bg: 'paper', size: 'normal', where: 'error messages' },
  { fg: 'error', bg: 'paper-deep', size: 'normal', where: 'error messages in wells' },
  { fg: 'error', bg: 'surface', size: 'normal', where: 'error notes in cards' },
];
