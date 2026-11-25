/**
 * The summary lines the screens and sheets show, built from the copy file. Every
 * function takes the copy for one language, so wording stays out of the logic and
 * the logic stays out of the copy. Strings and rules are from the design boards'
 * scripts (AddMedicine, SunArc, HowLong, DesktopEntry, LiveSheet, Household).
 */
import type { PillColor } from './colors';
import { courseDays, extraDays, isMissing } from './course';
import { SPOON_ML, type PillForm } from './pillUnits';
import { dosesPerDay, scheduledDoses } from './timing';
import type { Medicine, Rule, TimeOfDay } from './types';

export interface Plural {
  one: string;
  other: string;
}

export interface WordingCopy {
  times: Record<TimeOfDay, { name: string; at: string }>;
  colors: Record<PillColor, string>;
  /** As they read inside a sentence ("with food"). */
  rules: Record<Rule, string>;
  units: {
    tablet: Plural;
    capsule: Plural;
    drop: Plural;
    puff: Plural;
    spoon: Plural;
    day: Plural;
    dose: Plural;
    ml: string;
  };
  half: string;
  separator: string;
  noValue: string;
  /** "a, b and c". */
  list: (items: readonly string[]) => string;
  /** More than four times: "6 times, sunrise to night". */
  manyTimes: (names: readonly string[]) => string;
  capitalize: (text: string) => string;
  /** "about 6 am · 12 noon · 6 pm". */
  about: (clockTimes: readonly string[]) => string;
  colorLabel: { solid: string; liquid: string };
  builder: {
    tablet: (qty: string, color: string, score: boolean, oval: boolean) => string;
    capsule: (qty: string, cap: string, body: string) => string;
    liquid: (qty: string, spoons: string, color: string) => string;
    drops: (qty: string, color: string) => string;
    inhaler: (qty: string, color: string) => string;
  };
  when: {
    count: {
      whenNeeded: (max: number) => { big: string; small: string };
      every: (hours: number, perDay: number) => { big: string; small: string };
      fixed: (perDay: number) => { big: string; small: string };
    };
    whenNeeded: { title: string; detail: (qty: string, max: number) => string };
    empty: { title: string; errorTitle: string; detail: Record<WordingVariant, string> };
    everyTitle: (hours: number, times: string) => string;
    fixedDetail: (qty: string, about: string) => string;
  };
  howLong: {
    length: (days: string, doses: string | null) => string;
    inAll: (count: number, unit: string) => string;
    ongoing: Record<
      WordingVariant,
      { title: (perDay: number) => string; detail: string; note: string }
    >;
    missing: {
      title: string;
      errorTitle: string;
      detail: Record<WordingVariant, string>;
      note: Record<WordingVariant, string>;
      errorNote: Record<WordingVariant, string>;
    };
    filled: {
      detail: Record<WordingVariant, (boxes: number) => string>;
      whenNeededDetail: string;
      note: Record<WordingVariant, (extra: number) => string>;
    };
  };
  rail: {
    medicine: (name: string, form: string) => string;
    tablet: (qty: string, color: string) => string;
    capsule: (qty: string, cap: string, body: string) => string;
    liquid: (qty: string, color: string) => string;
    whenNeeded: string;
    noEnd: string;
    noRules: string;
  };
  household: {
    perDay: (n: number) => string;
    whenNeeded: string;
    atMost: (max: number) => string;
    noEnd: string;
  };
  sheet: {
    ongoing: string;
    missing: string;
    extra: (days: number) => string;
  };
}

/** Touch screens say "tap"; the desktop split view says "click" and names its keys. */
export type WordingVariant = 'touch' | 'desktop';

export type Tone = 'normal' | 'error';

export interface SummaryText {
  title: string;
  detail: string;
  tone: Tone;
}

/** The design's plural rule: more than one takes the plural ("½ tablet", "1½ tablets"). */
export const plural = (n: number, word: Plural): string => (n > 1 ? word.other : word.one);

/** Halves as the ½ sign: 0.5 → "½", 1.5 → "1½", 2 → "2". */
export function formatHalves(n: number, copy: WordingCopy): string {
  const whole = Math.floor(n);
  return (whole ? String(whole) : '') + (n % 1 ? copy.half : '');
}

/** The stepper's reading: the number and its unit. */
export function quantityParts(
  form: PillForm,
  qty: number,
  copy: WordingCopy,
): { value: string; unit: string } {
  const { units } = copy;
  switch (form) {
    case 'tablet':
    case 'oval':
      return { value: formatHalves(qty, copy), unit: plural(qty, units.tablet) };
    case 'capsule':
      return { value: String(qty), unit: plural(qty, units.capsule) };
    case 'liquid':
      return { value: String(qty), unit: units.ml };
    case 'drops':
      return { value: String(qty), unit: plural(qty, units.drop) };
    case 'inhaler':
      return { value: String(qty), unit: plural(qty, units.puff) };
  }
}

/** "1½ tablets", "7.5 ml", "2 drops". */
export function quantity(medicine: Pick<Medicine, 'form' | 'qty'>, copy: WordingCopy): string {
  const { value, unit } = quantityParts(medicine.form, medicine.qty, copy);
  return `${value} ${unit}`;
}

/** The label over the colour swatches. */
export const colorLabel = (form: PillForm, copy: WordingCopy): string =>
  form === 'liquid' || form === 'drops' ? copy.colorLabel.liquid : copy.colorLabel.solid;

/** The Pill Builder's line under the stepper: "1 capsule · red cap, yellow body". */
export function builderSummary(medicine: Medicine, copy: WordingCopy): string {
  const qty = quantity(medicine, copy);
  const color = copy.colors[medicine.color];
  switch (medicine.form) {
    case 'tablet':
    case 'oval':
      return copy.builder.tablet(qty, color, medicine.score, medicine.form === 'oval');
    case 'capsule':
      return copy.builder.capsule(qty, color, copy.colors[medicine.color2]);
    case 'liquid': {
      const spoons = medicine.qty / SPOON_ML;
      const spoonText = `${formatHalves(spoons, copy)} ${plural(spoons, copy.units.spoon)}`;
      return copy.builder.liquid(qty, spoonText, color);
    }
    case 'drops':
      return copy.builder.drops(qty, color);
    case 'inhaler':
      return copy.builder.inhaler(qty, color);
  }
}

/** "sunrise, midday and sunset"; more than four: "6 times, sunrise to night". */
export function timesList(times: readonly TimeOfDay[], copy: WordingCopy): string {
  const names = times.map((t) => copy.times[t].name);
  return names.length > 4 ? copy.manyTimes(names) : copy.list(names);
}

/** "about 6 am · 12 noon · 6 pm". */
export const clockTimes = (times: readonly TimeOfDay[], copy: WordingCopy): string =>
  copy.about(times.map((t) => copy.times[t].at));

/** The big reading in the middle of the sun arc: "3" / "a day", "8 h" / "apart · 3 a day". */
export function whenCount(medicine: Medicine, copy: WordingCopy): { big: string; small: string } {
  const { timing } = medicine;
  const perDay = dosesPerDay(timing);
  if (timing.mode === 'whenNeeded') return copy.when.count.whenNeeded(timing.maxPerDay);
  if (perDay > 0 && timing.mode === 'every') {
    return copy.when.count.every(timing.everyHours, perDay);
  }
  return copy.when.count.fixed(perDay);
}

export interface WordingOptions {
  variant?: WordingVariant | undefined;
  /** Someone tried to continue without an answer. */
  error?: boolean | undefined;
}

/** The "When" summary under the sun arc. */
export function whenSummary(
  medicine: Medicine,
  copy: WordingCopy,
  { variant = 'touch', error = false }: WordingOptions = {},
): SummaryText {
  const { timing } = medicine;
  const qty = quantity(medicine, copy);
  const doses = scheduledDoses(timing);
  if (timing.mode === 'whenNeeded') {
    const t = copy.when.whenNeeded;
    return { title: t.title, detail: t.detail(qty, timing.maxPerDay), tone: 'normal' };
  }
  if (doses.length === 0) {
    const t = copy.when.empty;
    return {
      title: error ? t.errorTitle : t.title,
      detail: t.detail[variant],
      tone: error ? 'error' : 'normal',
    };
  }
  const about = clockTimes(doses, copy);
  if (timing.mode === 'every') {
    return {
      title: copy.when.everyTitle(timing.everyHours, timesList(doses, copy)),
      detail: about,
      tone: 'normal',
    };
  }
  // On a phone, four or more times leave no room for the quantity.
  const withQty = variant === 'desktop' || doses.length <= 3;
  return {
    title: copy.capitalize(timesList(doses, copy)),
    detail: withQty ? copy.when.fixedDetail(qty, about) : about,
    tone: 'normal',
  };
}

const daysText = (days: number, copy: WordingCopy) =>
  `${String(days)} ${plural(days, copy.units.day)}`;

/**
 * "21 capsules" when each dose is whole tablets or capsules, which can be counted;
 * otherwise "21 doses".
 */
function inAll(medicine: Medicine, doses: number, copy: WordingCopy): string {
  const countable =
    (medicine.form === 'tablet' || medicine.form === 'oval' || medicine.form === 'capsule') &&
    Number.isInteger(medicine.qty);
  if (!countable) return copy.howLong.inAll(doses, plural(doses, copy.units.dose));
  const units = doses * medicine.qty;
  const word = medicine.form === 'capsule' ? copy.units.capsule : copy.units.tablet;
  return copy.howLong.inAll(units, plural(units, word));
}

export interface HowLongText extends SummaryText {
  /** The handwritten note beside the course grid. */
  note: string;
}

/** The "How long" summary and the note by the grid. */
export function howLongSummary(
  medicine: Medicine,
  copy: WordingCopy,
  { variant = 'touch', error = false }: WordingOptions = {},
): HowLongText {
  const { course } = medicine;
  const t = copy.howLong;
  const perDay = dosesPerDay(medicine.timing);
  if (course.ongoing) {
    const o = t.ongoing[variant];
    return { title: o.title(perDay), detail: o.detail, note: o.note, tone: 'normal' };
  }
  const days = courseDays(course);
  if (days === null) {
    return {
      title: error ? t.missing.errorTitle : t.missing.title,
      detail: t.missing.detail[variant],
      note: error ? t.missing.errorNote[variant] : t.missing.note[variant],
      tone: error ? 'error' : 'normal',
    };
  }
  const doses = days * perDay;
  const countText = variant === 'touch' ? inAll(medicine, doses, copy) : inAllDoses(doses, copy);
  return {
    title: t.length(daysText(days, copy), perDay ? countText : null),
    detail: perDay ? t.filled.detail[variant](doses) : t.filled.whenNeededDetail,
    note: t.filled.note[variant](extraDays(course)),
    tone: 'normal',
  };
}

const inAllDoses = (doses: number, copy: WordingCopy) =>
  copy.howLong.inAll(doses, plural(doses, copy.units.dose));

/** The rules as one phrase: "with food, keep cool". */
export const rulesText = (rules: readonly Rule[], copy: WordingCopy): string =>
  rules.map((r) => copy.rules[r]).join(', ');

/** "1 capsule, red and yellow": the desktop rail's shorter form of the builder summary. */
function railForm(medicine: Medicine, copy: WordingCopy): string {
  const qty = quantity(medicine, copy);
  const color = copy.colors[medicine.color];
  switch (medicine.form) {
    case 'tablet':
    case 'oval':
      return copy.rail.tablet(qty, color);
    case 'capsule':
      return copy.rail.capsule(qty, color, copy.colors[medicine.color2]);
    case 'liquid':
      return copy.rail.liquid(qty, color);
    case 'drops':
    case 'inhaler':
      return qty;
  }
}

/**
 * The desktop step rail's one-line summaries, in step order. A step not answered
 * yet shows a dash; rules show "none" once the rules step has been reached.
 */
export function railSummaries(
  medicine: Medicine,
  copy: WordingCopy,
  { rulesReached = false }: { rulesReached?: boolean } = {},
): [medicine: string, when: string, howLong: string, rules: string] {
  const form = railForm(medicine, copy);
  const doses = scheduledDoses(medicine.timing);
  const days = courseDays(medicine.course);
  let when = copy.noValue;
  if (medicine.timing.mode === 'whenNeeded') when = copy.rail.whenNeeded;
  else if (doses.length) when = timesList(doses, copy);
  let howLong = copy.noValue;
  if (medicine.course.ongoing) howLong = copy.rail.noEnd;
  else if (days !== null) howLong = daysText(days, copy);
  let rules = rulesReached ? copy.rail.noRules : copy.noValue;
  if (medicine.rules.length) rules = rulesText(medicine.rules, copy);
  return [medicine.name ? copy.rail.medicine(medicine.name, form) : form, when, howLong, rules];
}

/**
 * A medicine's line on the household screen: "3 a day · 7 days · with food", or
 * "only when needed · at most 4 a day". A when-needed medicine with no end date
 * leaves the length out: that is what "when needed" already means.
 */
export function householdRow(medicine: Medicine, copy: WordingCopy): string {
  const { timing, course } = medicine;
  const t = copy.household;
  const whenNeeded = timing.mode === 'whenNeeded';
  const parts = whenNeeded
    ? [t.whenNeeded, t.atMost(timing.maxPerDay)]
    : [t.perDay(dosesPerDay(timing))];
  const days = courseDays(course);
  if (days !== null) parts.push(daysText(days, copy));
  else if (course.ongoing && !whenNeeded) parts.push(t.noEnd);
  if (medicine.rules.length) parts.push(rulesText(medicine.rules, copy));
  return parts.join(copy.separator);
}

/** The handwritten note under the sheet's course grid, or null when there is none. */
export function sheetNote(medicine: Medicine, copy: WordingCopy): string | null {
  const { course } = medicine;
  if (course.ongoing) return copy.sheet.ongoing;
  if (isMissing(course)) return copy.sheet.missing;
  const extra = extraDays(course);
  return extra ? copy.sheet.extra(extra) : null;
}
