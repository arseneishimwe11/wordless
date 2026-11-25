/**
 * The schedule printed on each sheet as a QR code, so the next clinic can scan it
 * back in, offline. The whole person's schedule fits in the code:
 *
 *   "WL1:" + Base45( version · person · medicines · CRC-16 )
 *
 * Every field is a small number packed into a few bits (see README, "Data"), and
 * text is length-prefixed UTF-8. Base45 keeps the text within the QR code's compact
 * alphanumeric mode. Decoding never throws: it says what is wrong instead.
 */
import { PILL_COLORS } from '../colors';
import { HOUSEHOLD_MARKS } from '../household';
import { newId } from '../id';
import { QTY_STEPS } from '../medicine';
import { PILL_FORMS } from '../pillUnits';
import { metaSchema, personSchema } from '../schema';
import {
  COURSE_UNITS,
  EVERY_HOURS,
  RULES,
  TIMES_OF_DAY,
  TIMING_MODES,
  type Medicine,
  type Person,
} from '../types';

import { decodeBase45, encodeBase45 } from './base45';
import { BitReader, BitWriter } from './bits';
import { crc16 } from './crc16';

export const CODE_VERSION = 1;

const PREFIX = /^WL(\d+):/;

/** Day 1 is 2020-01-01; 0 means no date. */
const EPOCH = Date.UTC(2020, 0, 1);
const DAY_MS = 86_400_000;

export interface ScheduleMeta {
  preparedBy: string;
  /** The day the sheet was prepared, as YYYY-MM-DD (2020 to 2199), or null. */
  preparedOn: string | null;
}

export type DecodeError =
  /** Not a Wordless code at all (another QR code, or a typo). */
  | 'not-wordless'
  /** Made by a newer version of Wordless: update the app to read it. */
  | 'newer-version'
  /** A Wordless code that didn't scan cleanly: try again, closer or in better light. */
  | 'damaged'
  /** Scanned cleanly but doesn't hold a valid schedule. */
  | 'invalid';

export type DecodeResult =
  { ok: true; person: Person; meta: ScheduleMeta } | { ok: false; error: DecodeError };

const utf8 = new TextEncoder();
const fromUtf8 = new TextDecoder('utf-8', { fatal: true });

/** A set as one bit per possible member, first member in the highest bit. */
function toBits<T>(all: readonly T[], chosen: readonly T[]): number {
  return all.reduce(
    (bits, item, i) => (chosen.includes(item) ? bits | (1 << (all.length - 1 - i)) : bits),
    0,
  );
}

function fromBits<T>(all: readonly T[], bits: number): T[] {
  return all.filter((_, i) => (bits >> (all.length - 1 - i)) & 1);
}

function writeText(w: BitWriter, text: string) {
  const bytes = utf8.encode(text);
  w.write(bytes.length, 8);
  w.writeBytes(bytes);
}

function readText(r: BitReader): string {
  return fromUtf8.decode(r.readBytes(r.read(8)));
}

const dayNumber = (isoDate: string | null): number =>
  isoDate === null ? 0 : Math.round((Date.parse(`${isoDate}T00:00:00Z`) - EPOCH) / DAY_MS) + 1;

const isoDate = (day: number): string | null =>
  day === 0 ? null : new Date(EPOCH + (day - 1) * DAY_MS).toISOString().slice(0, 10);

function writeMedicine(w: BitWriter, m: Medicine) {
  w.write(PILL_FORMS.indexOf(m.form), 3);
  w.write(PILL_COLORS.indexOf(m.color), 4);
  w.write(PILL_COLORS.indexOf(m.color2), 4);
  w.write(m.score ? 1 : 0, 1);
  w.write(QTY_STEPS[m.form].indexOf(m.qty), 4);
  w.write(TIMING_MODES.indexOf(m.timing.mode), 2);
  w.write(toBits(TIMES_OF_DAY, m.timing.doses), 6);
  w.write(EVERY_HOURS.indexOf(m.timing.everyHours), 2);
  w.write(m.timing.maxPerDay, 3);
  w.write(m.course.ongoing ? 1 : 0, 1);
  w.write(COURSE_UNITS.indexOf(m.course.unit), 1);
  w.write(m.course.amount ?? 0, 7);
  w.write(toBits(RULES, m.rules), 7);
  writeText(w, m.name);
}

/**
 * Reads one medicine. Indexes past the end of a list come back undefined and are
 * left for the schema to reject, so a bad field never turns into a wrong value.
 */
function readMedicine(r: BitReader): unknown {
  const form = PILL_FORMS[r.read(3)];
  const color = PILL_COLORS[r.read(4)];
  const color2 = PILL_COLORS[r.read(4)];
  const score = r.read(1) === 1;
  const qtyIndex = r.read(4);
  const qty = form === undefined ? undefined : QTY_STEPS[form][qtyIndex];
  const mode = TIMING_MODES[r.read(2)];
  const doses = fromBits(TIMES_OF_DAY, r.read(6));
  const everyHours = EVERY_HOURS[r.read(2)];
  const maxPerDay = r.read(3);
  const ongoing = r.read(1) === 1;
  const unit = COURSE_UNITS[r.read(1)];
  const amount = r.read(7);
  const rules = fromBits(RULES, r.read(7));
  const name = readText(r);
  return {
    id: newId(),
    name,
    form,
    color,
    color2,
    score,
    qty,
    timing: { mode, doses, everyHours, maxPerDay },
    course: { ongoing, unit, amount: amount === 0 ? null : amount },
    rules,
  };
}

/** The code for one person's schedule. Throws only if the person or details aren't valid. */
export function encodeSchedule(person: Person, meta: ScheduleMeta): string {
  personSchema.parse(person);
  metaSchema.parse(meta);
  const w = new BitWriter();
  w.write(CODE_VERSION, 8);
  w.write(HOUSEHOLD_MARKS.indexOf(person.mark), 2);
  w.write(person.medicines.length, 6);
  writeText(w, person.label);
  writeText(w, meta.preparedBy);
  w.write(dayNumber(meta.preparedOn), 16);
  for (const m of person.medicines) writeMedicine(w, m);
  const body = w.bytes();
  const crc = crc16(body);
  const bytes = Uint8Array.from([...body, crc >> 8, crc & 0xff]);
  return `WL${String(CODE_VERSION)}:${encodeBase45(bytes)}`;
}

/** Reads a scanned code back into a person (with fresh ids) and the sheet's details. */
export function decodeSchedule(text: string): DecodeResult {
  const prefix = PREFIX.exec(text.trim());
  if (!prefix) return { ok: false, error: 'not-wordless' };
  if (Number(prefix[1]) > CODE_VERSION) return { ok: false, error: 'newer-version' };

  const bytes = decodeBase45(text.trim().slice(prefix[0].length));
  if (!bytes || bytes.length < 3) return { ok: false, error: 'damaged' };
  const body = bytes.subarray(0, -2);
  const crc = new DataView(bytes.buffer, bytes.byteOffset).getUint16(bytes.length - 2);
  if (crc16(body) !== crc) return { ok: false, error: 'damaged' };

  const r = new BitReader(body);
  try {
    const version = r.read(8);
    if (version > CODE_VERSION) return { ok: false, error: 'newer-version' };
    if (version !== CODE_VERSION) return { ok: false, error: 'invalid' };
    const mark = HOUSEHOLD_MARKS[r.read(2)];
    const count = r.read(6);
    const label = readText(r);
    const preparedBy = readText(r);
    const preparedOn = isoDate(r.read(16));
    const medicines = Array.from({ length: count }, () => readMedicine(r));
    if (!r.atPaddedEnd()) return { ok: false, error: 'invalid' };

    const person = personSchema.safeParse({ id: newId(), label, mark, medicines });
    const meta = metaSchema.safeParse({ preparedBy, preparedOn });
    if (!person.success || !meta.success) return { ok: false, error: 'invalid' };
    return { ok: true, person: person.data, meta: meta.data };
  } catch {
    // Running out of data (OutOfData), or text that isn't UTF-8 (TypeError).
    return { ok: false, error: 'invalid' };
  }
}
