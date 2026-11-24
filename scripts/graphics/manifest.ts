/**
 * Where the canonical copy of each graphic lives in design/source.
 *
 * The design jitters the ink lines of every repeated mark. One copy of each is
 * kept, taken from the board that presents it (Pictograms, Pills, Main) so those
 * boards reproduce exactly. A copy is found by its aria-label, or by its position
 * among the file's SVGs that share a viewBox.
 */

export interface SourceRef {
  file: string;
  /** Defaults to the 48-unit pictogram grid. */
  viewBox?: string;
  label?: string;
  index?: number;
}

export interface ManifestEntry extends SourceRef {
  name: string;
}

const GRID = '0 0 48 48';
const P = 'Pictograms.dc.html';
const PILLS = 'Pills.dc.html';
const BUILDER = 'AddMedicine.dc.html';

/** 48-unit pictograms: times of day, rules, marks, swatches, household marks. */
export const glyphs: ManifestEntry[] = [
  // When: what is in the sky
  { name: 'sunrise', file: P, label: 'Sunrise' },
  { name: 'mid-morning', file: P, label: 'Mid-morning' },
  { name: 'midday', file: P, label: 'Midday' },
  { name: 'afternoon', file: P, label: 'Afternoon' },
  { name: 'sunset', file: P, label: 'Sunset' },
  { name: 'night', file: P, label: 'Night' },
  { name: 'when-needed', file: P, label: 'Only when needed' },
  // How: food, drink and care
  { name: 'with-food', file: P, label: 'With food' },
  { name: 'empty-stomach', file: P, label: 'Empty stomach' },
  { name: 'with-water', file: P, label: 'With water' },
  { name: 'no-alcohol', file: P, label: 'No alcohol' },
  { name: 'sleepiness', file: P, label: 'May cause sleepiness' },
  { name: 'keep-cool', file: P, label: 'Keep cool' },
  { name: 'shake-first', file: P, label: 'Shake first' },
  // Marks: solid means take it, dashed means only if needed
  { name: 'take-it', file: P, label: 'Take it — tick' },
  { name: 'taken', file: P, label: 'Taken' },
  { name: 'if-needed', file: P, label: 'Only if needed' },
  { name: 'no-more', file: P, label: 'No more today' },
  { name: 'course-done', file: P, label: 'Course done' },
  { name: 'patient', file: P, label: 'Patient' },
  { name: 'tick-each-time', file: P, label: 'Tick each time' },
  // The Pictograms board's "ink + one flat colour" demonstration
  { name: 'demo-ink', file: P, index: 0 },
  { name: 'demo-color', file: P, index: 1 },
  // Sheet and Sun Arc marks
  {
    name: 'dose-if-needed-tablet',
    file: 'FridgeSheet.dc.html',
    label: 'One tablet, only if needed',
  },
  { name: 'dose-if-needed-capsule', file: 'SunArc.dc.html', index: 21 },
  { name: 'fifth-crossed', file: 'FridgeSheet.dc.html', label: 'A fifth tablet, crossed out' },
  { name: 'repeat', file: 'HowLong.dc.html', index: 5 },
  { name: 'sun-small', file: 'DesktopEntry.dc.html', index: 29 },
  { name: 'moon', file: 'DesktopEntry.dc.html', index: 96 },
  // Pill Builder form buttons
  { name: 'form-tablet', file: BUILDER, index: 10 },
  { name: 'form-oval', file: BUILDER, index: 11 },
  { name: 'form-capsule', file: BUILDER, index: 12 },
  { name: 'form-liquid', file: BUILDER, index: 13 },
  { name: 'form-drops', file: BUILDER, index: 14 },
  { name: 'form-inhaler', file: BUILDER, index: 15 },
  // Colour + pattern swatches
  { name: 'swatch-white', file: PILLS, label: 'White' },
  { name: 'swatch-yellow', file: PILLS, label: 'Yellow' },
  { name: 'swatch-orange', file: PILLS, label: 'Orange' },
  { name: 'swatch-pink', file: PILLS, label: 'Pink' },
  { name: 'swatch-red', file: PILLS, label: 'Red' },
  { name: 'swatch-brown', file: PILLS, label: 'Brown' },
  { name: 'swatch-green', file: PILLS, label: 'Green' },
  { name: 'swatch-blue', file: PILLS, label: 'Blue' },
  { name: 'swatch-purple', file: PILLS, label: 'Purple' },
  { name: 'swatch-dark', file: PILLS, label: 'Dark' },
  // Household marks: one colour and pattern per person
  { name: 'household-a', file: PILLS, label: 'Household mark A' },
  { name: 'household-b', file: PILLS, label: 'Household mark B' },
  { name: 'household-c', file: PILLS, label: 'Household mark C' },
  { name: 'household-d', file: PILLS, label: 'Household mark D' },
  // Landing page
  { name: 'landing-stopped-early', file: 'Landing.dc.html', index: 3 },
  { name: 'landing-any-language', file: 'Landing.dc.html', index: 13 },
  { name: 'landing-offline', file: 'Landing.dc.html', index: 14 },
  { name: 'stamp-as-prescribed', file: 'Landing.dc.html', label: 'A stamp: as prescribed' },
].map((entry) => ({ viewBox: GRID, ...entry }));

/**
 * Pill templates from the Pill Builder, in the order the design lists them
 * (isTab, isOval, isHalf, isCap, isSpoon, isSpoonHalf, isDropper, isDrop, isInh, isPuff).
 */
export const pills: ManifestEntry[] = [
  'tablet',
  'oval',
  'half',
  'capsule',
  'spoon',
  'spoon-half',
  'dropper',
  'drop',
  'inhaler',
  'puff',
].map((name, index) => ({ name, file: BUILDER, viewBox: GRID, index }));

/** Interface icons. Drawn in currentColor, so they take the colour of their text. */
export const icons: ManifestEntry[] = [
  { name: 'back', file: BUILDER, viewBox: '0 0 24 24', index: 0 },
  { name: 'minus', file: BUILDER, viewBox: '0 0 26 26', index: 0 },
  { name: 'plus', file: BUILDER, viewBox: '0 0 26 26', index: 1 },
  { name: 'arrow', file: BUILDER, viewBox: '0 0 28 24', index: 0 },
  { name: 'edit', file: 'HowLong.dc.html', viewBox: '0 0 26 26', index: 0 },
  { name: 'qr', file: 'Start.dc.html', viewBox: '0 0 26 26', index: 1 },
  { name: 'scissors', file: 'DailyStrip.dc.html', viewBox: '0 0 26 20', index: 0 },
  { name: 'check', file: 'Landing.dc.html', viewBox: '0 0 24 24', index: 0 },
  { name: 'print-sheet', file: 'DesktopPrint.dc.html', viewBox: '0 0 44 48', index: 0 },
  { name: 'print-strips', file: 'DesktopPrint.dc.html', viewBox: '0 0 44 48', index: 1 },
];

/** Larger drawings. Each becomes its own module so routes load only what they use. */
export const illustrations: ManifestEntry[] = [
  { name: 'logo', file: 'Main.dc.html', viewBox: '0 0 120 120', index: 0 },
  { name: 'medicine-box', file: 'Main.dc.html', viewBox: '0 0 520 340', index: 0 },
  { name: 'sun-path', file: 'Main.dc.html', viewBox: '0 0 1264 330', index: 0 },
  { name: 'sunrise-grid', file: P, viewBox: '0 0 288 288', index: 0 },
  { name: 'start-sky', file: 'Start.dc.html', viewBox: '0 0 390 260', index: 0 },
  { name: 'builder-well', file: BUILDER, viewBox: '0 0 358 172', index: 0 },
  { name: 'builder-well-desktop', file: 'DesktopEntry.dc.html', viewBox: '0 0 320 420', index: 0 },
  { name: 'sun-arc-ground', file: 'SunArc.dc.html', viewBox: '0 0 390 356', index: 0 },
  { name: 'sun-arc-bands', file: 'SunArc.dc.html', viewBox: '0 0 390 356', index: 1 },
  { name: 'sun-arc-prn', file: 'SunArc.dc.html', viewBox: '0 0 390 356', index: 2 },
  { name: 'sun-arc-desktop', file: 'DesktopEntry.dc.html', viewBox: '0 0 520 410', index: 0 },
  { name: 'sun-arc-desktop-prn', file: 'DesktopEntry.dc.html', viewBox: '0 0 520 410', index: 1 },
  { name: 'sun-rays', file: 'SunArc.dc.html', viewBox: '0 0 68 68', index: 0 },
  { name: 'hint-arrow', file: 'SunArc.dc.html', viewBox: '0 0 60 150', index: 0 },
  { name: 'sheet-rule-top', file: 'FridgeSheet.dc.html', viewBox: '36 492 722 10', index: 0 },
  { name: 'sheet-rule-bottom', file: 'FridgeSheet.dc.html', viewBox: '36 940 722 10', index: 0 },
  // The landing hero (560×420) arrives in Phase 9: it holds words that belong in src/copy
  // and animation hooks that only make sense with the landing page's own styles.
];
