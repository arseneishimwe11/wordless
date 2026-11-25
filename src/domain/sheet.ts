/**
 * What a person's fridge sheet shows, as content: which time columns, what goes in
 * each cell, and the boxes to tick. Sizes and drawing are left to the sheet
 * components. The rules follow LiveSheet.dc.html.
 */
import { courseDays, extraDays, isMissing, shownDays } from './course';
import { pillUnits, type PillUnitKind } from './pillUnits';
import { scheduledDoses } from './timing';
import { TIMES_OF_DAY, type Medicine, type Person, type Rule, type TimeOfDay } from './types';

/** The sheet always has these four columns, so every sheet reads the same way. */
export const BASE_COLUMNS: readonly TimeOfDay[] = ['sunrise', 'midday', 'sunset', 'night'];

export interface SheetCell {
  time: TimeOfDay;
  /** A dose goes in at this time. */
  dose: boolean;
  /** What to take, drawn unit by unit; empty when there's no dose. */
  units: PillUnitKind[];
  /** The "with food" mark sits in each dose cell. */
  withFood: boolean;
}

interface RowBase {
  medicine: Medicine;
  /** The drawing that stands for the medicine at the start of its row. */
  keyUnit: PillUnitKind;
  /** All its rules, shown once beside the name. */
  rules: Rule[];
}

export interface ScheduledRow extends RowBase {
  kind: 'scheduled';
  cells: SheetCell[];
  /** Still being entered with no times yet: the cells read "no times yet". */
  noTimes: boolean;
}

export interface WhenNeededRow extends RowBase {
  kind: 'whenNeeded';
  /** One dose, drawn unit by unit. */
  units: PillUnitKind[];
  /** "No more today" after this many. */
  maxPerDay: number;
}

export type SheetRow = ScheduledRow | WhenNeededRow;

export type BoxStyle = 'solid' | 'dashed';

/** The boxes to tick for a scheduled medicine: one row per dose time, one box per day. */
export interface CourseGrid {
  kind: 'grid';
  medicineId: string;
  /** Day numbers along the top; null for a dot while the length is missing. */
  days: (number | null)[];
  rows: { time: TimeOfDay; box: BoxStyle }[];
  /** Drawn faded while the length is missing. */
  faded: boolean;
  /** Days beyond the two weeks shown. */
  extraDays: number;
  /** The finish stamp for a set course; the repeat mark for one with no end date. */
  end: 'stamp' | 'repeat' | null;
}

/** For a when-needed medicine: a dashed circle per possible dose, per day. */
export interface Tally {
  kind: 'tally';
  medicineId: string;
  days: (number | null)[];
  perDay: number;
  end: 'repeat' | null;
}

export type CourseTrack = CourseGrid | Tally;

export interface Sheet {
  columns: TimeOfDay[];
  rows: SheetRow[];
  tracks: CourseTrack[];
}

/** The unit drawn at the start of a medicine's row (from the live sheet). */
export function keyUnit(medicine: Pick<Medicine, 'form' | 'qty'>): PillUnitKind {
  switch (medicine.form) {
    case 'tablet':
      return medicine.qty < 1 ? 'half' : 'tablet';
    case 'oval':
      return 'oval';
    case 'capsule':
      return 'capsule';
    case 'liquid':
      return 'spoon';
    case 'drops':
      return 'dropper';
    case 'inhaler':
      return 'inhaler';
  }
}

/**
 * The sheet's time columns. Usually the four base columns, so every sheet reads the
 * same way. When a dose falls at another time (every 8 h puts one in the afternoon),
 * the columns follow the doses instead, as on the printed edge-case board.
 */
export function sheetColumns(medicines: readonly Medicine[]): TimeOfDay[] {
  const used = new Set(medicines.flatMap((m) => scheduledDoses(m.timing)));
  const fitsBase = [...used].every((t) => BASE_COLUMNS.includes(t));
  return fitsBase ? [...BASE_COLUMNS] : TIMES_OF_DAY.filter((t) => used.has(t));
}

function row(medicine: Medicine, columns: readonly TimeOfDay[]): SheetRow {
  const base = { medicine, keyUnit: keyUnit(medicine), rules: medicine.rules };
  const units = pillUnits(medicine.form, medicine.qty);
  if (medicine.timing.mode === 'whenNeeded') {
    return { ...base, kind: 'whenNeeded', units, maxPerDay: medicine.timing.maxPerDay };
  }
  const doses = scheduledDoses(medicine.timing);
  const withFood = medicine.rules.includes('withFood');
  return {
    ...base,
    kind: 'scheduled',
    noTimes: doses.length === 0,
    cells: columns.map((time) => {
      const dose = doses.includes(time);
      return { time, dose, units: dose ? units : [], withFood: dose && withFood };
    }),
  };
}

function dayNumbers(medicine: Medicine): (number | null)[] {
  const missing = isMissing(medicine.course);
  return Array.from({ length: shownDays(medicine.course) }, (_, i) => (missing ? null : i + 1));
}

function track(medicine: Medicine): CourseTrack {
  const { course } = medicine;
  const days = dayNumbers(medicine);
  if (medicine.timing.mode === 'whenNeeded') {
    return {
      kind: 'tally',
      medicineId: medicine.id,
      days,
      perDay: medicine.timing.maxPerDay,
      end: course.ongoing ? 'repeat' : null,
    };
  }
  const doses = scheduledDoses(medicine.timing);
  const missing = isMissing(course);
  // With no times yet, one dashed sunrise row stands in for the rows to come.
  const rows = doses.length
    ? doses.map((time) => ({ time, box: missing ? ('dashed' as const) : ('solid' as const) }))
    : [{ time: 'sunrise' as const, box: 'dashed' as const }];
  let end: CourseGrid['end'] = null;
  if (course.ongoing) end = 'repeat';
  else if (courseDays(course) !== null) end = 'stamp';
  return {
    kind: 'grid',
    medicineId: medicine.id,
    days,
    rows,
    faded: missing,
    extraDays: extraDays(course),
    end,
  };
}

export function sheetFor(person: Pick<Person, 'medicines'>): Sheet {
  const columns = sheetColumns(person.medicines);
  return {
    columns,
    rows: person.medicines.map((m) => row(m, columns)),
    tracks: person.medicines.map(track),
  };
}
