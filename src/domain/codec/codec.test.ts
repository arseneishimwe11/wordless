import { describe, expect, it } from 'vitest';

import { PILL_COLORS } from '../colors';
import { HOUSEHOLD_MARKS } from '../household';
import { canHaveScore, QTY_STEPS } from '../medicine';
import { PILL_FORMS } from '../pillUnits';
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
import { decodeSchedule, encodeSchedule, type ScheduleMeta } from './schedule';

const bytes = (text: string) => new TextEncoder().encode(text);

describe('base45 (RFC 9285 test vectors)', () => {
  it.each([
    ['AB', 'BB8'],
    ['Hello!!', '%69 VD92EX0'],
    ['base-45', 'UJCLQE7W581'],
    ['ietf!', 'QED8WEX0'],
  ])('%s ↔ %s', (plain, encoded) => {
    expect(encodeBase45(bytes(plain))).toBe(encoded);
    expect(new TextDecoder().decode(decodeBase45(encoded) ?? undefined)).toBe(plain);
  });

  it('rejects text that is not base45', () => {
    expect(decodeBase45('GGW')).toBeNull(); // 65535 + 1: too large for two bytes
    expect(decodeBase45('ZZ')).toBeNull(); // too large for one byte
    expect(decodeBase45('abc')).toBeNull(); // lower case is not in the alphabet
    expect(decodeBase45('BB8B')).toBeNull(); // a dangling character
    expect(decodeBase45('')).toEqual(new Uint8Array());
  });
});

describe('crc16 (CCITT-FALSE)', () => {
  it('matches the standard check value', () => {
    expect(crc16(bytes('123456789'))).toBe(0x29b1);
    expect(crc16(new Uint8Array())).toBe(0xffff);
  });
});

describe('bits', () => {
  it('packs and unpacks fields of any width', () => {
    const w = new BitWriter();
    w.write(5, 3);
    w.write(1, 1);
    w.writeBytes(Uint8Array.from([0xab]));
    const r = new BitReader(w.bytes());
    expect([r.read(3), r.read(1), r.read(8)]).toEqual([5, 1, 0xab]);
    expect(r.atPaddedEnd()).toBe(true);
    expect(() => r.read(8)).toThrow();
  });
});

/** A small seeded generator, so a failure can be reproduced. */
function random(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)] as T;
  const some = <T>(list: readonly T[]): T[] => list.filter(() => next() < 0.4);
  return { next, pick, some };
}

const NAME_PARTS = [
  'Amoxicillin 500 mg',
  'Paracétamol',
  'Ibuprofène',
  'Сироп',
  'شراب',
  '阿莫西林',
  'アモキシシリン',
  '💊 Vitamin D',
  'Ñandú 👵🏽',
  'Metformin',
  '',
];

function randomMedicine(rng: ReturnType<typeof random>, id: string): Medicine {
  const form = rng.pick(PILL_FORMS);
  const rules = rng.some(RULES).filter((r) => r !== 'emptyStomach' || rng.next() < 0.5);
  return {
    id,
    name: rng.pick(NAME_PARTS).slice(0, 60),
    form,
    color: rng.pick(PILL_COLORS),
    color2: rng.pick(PILL_COLORS),
    score: canHaveScore(form) && rng.next() < 0.5,
    qty: rng.pick(QTY_STEPS[form]),
    timing: {
      mode: rng.pick(TIMING_MODES),
      doses: rng.some(TIMES_OF_DAY),
      everyHours: rng.pick(EVERY_HOURS),
      maxPerDay: 1 + Math.floor(rng.next() * 6),
    },
    course: {
      ongoing: rng.next() < 0.3,
      amount: rng.next() < 0.2 ? null : 1 + Math.floor(rng.next() * 90),
      unit: rng.pick(COURSE_UNITS),
    },
    rules: rules.includes('withFood') ? rules.filter((r) => r !== 'emptyStomach') : rules,
  };
}

function randomPerson(seed: number): { person: Person; meta: ScheduleMeta } {
  const rng = random(seed);
  const count = Math.floor(rng.next() * 7);
  const person: Person = {
    id: 'p',
    label: rng.pick(['Grandmother', 'Child', 'Ama', '奶奶', 'Grand-père 👴', '']),
    mark: rng.pick(HOUSEHOLD_MARKS),
    medicines: Array.from({ length: count }, (_, i) => randomMedicine(rng, `m${String(i)}`)),
  };
  const day = 1 + Math.floor(rng.next() * 3000);
  const meta: ScheduleMeta = {
    preparedBy: rng.pick(['[PHARMACY NAME]', 'Pharmacie du Marché', '城南药房', '']),
    preparedOn:
      rng.next() < 0.2 ? null : new Date(Date.UTC(2020, 0, day)).toISOString().slice(0, 10),
  };
  return { person, meta };
}

/** Ids are regenerated on decode; everything else must come back exactly. */
const withoutIds = (person: Person) => ({
  ...person,
  id: '',
  medicines: person.medicines.map((m) => ({ ...m, id: '' })),
});

const sample = (): { person: Person; meta: ScheduleMeta } => randomPerson(7);

describe('schedule code', () => {
  it('round-trips 500 random schedules exactly', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const { person, meta } = randomPerson(seed);
      const code = encodeSchedule(person, meta);
      expect(code).toMatch(/^WL1:[0-9A-Z $%*+\-./:]*$/);
      const result = decodeSchedule(code);
      if (!result.ok) throw new Error(`seed ${String(seed)}: ${result.error}`);
      expect(withoutIds(result.person)).toEqual(withoutIds(person));
      expect(result.meta).toEqual(meta);
    }
  });

  it('gives decoded medicines fresh, distinct ids', () => {
    const { person, meta } = randomPerson(3);
    const a = decodeSchedule(encodeSchedule(person, meta));
    const b = decodeSchedule(encodeSchedule(person, meta));
    if (!a.ok || !b.ok) throw new Error('decode failed');
    expect(a.person.id).not.toBe(b.person.id);
    expect(new Set([...a.person.medicines, ...b.person.medicines].map((m) => m.id)).size).toBe(
      a.person.medicines.length * 2,
    );
  });

  it('fits four medicines with 30-character names in a version 10 QR code (311 characters at level M)', () => {
    const name = 'Amoxicillin and clavulanate 50';
    expect(name).toHaveLength(30);
    const { person } = randomPerson(1);
    const four: Person = {
      ...person,
      label: 'Grandmother',
      medicines: [0, 1, 2, 3].map((i) => ({ ...randomMedicine(random(i), String(i)), name })),
    };
    const code = encodeSchedule(four, {
      preparedBy: 'Pharmacie du Marché Central',
      preparedOn: '2026-11-25',
    });
    expect(code.length).toBeLessThanOrEqual(311);
  });

  it('refuses to encode an invalid schedule', () => {
    const { person, meta } = sample();
    expect(() => encodeSchedule({ ...person, label: 'x'.repeat(61) }, meta)).toThrow();
    expect(() => encodeSchedule(person, { ...meta, preparedOn: '2019-12-31' })).toThrow();
  });

  describe('rejects what it cannot read', () => {
    const { person, meta } = sample();
    const code = encodeSchedule(person, meta);

    it('other codes and text', () => {
      expect(decodeSchedule('https://example.com')).toEqual({ ok: false, error: 'not-wordless' });
      expect(decodeSchedule('')).toEqual({ ok: false, error: 'not-wordless' });
    });

    it('codes from a newer version', () => {
      expect(decodeSchedule(code.replace('WL1:', 'WL2:'))).toEqual({
        ok: false,
        error: 'newer-version',
      });
    });

    it('a truncated or misread code', () => {
      expect(decodeSchedule(code.slice(0, -3))).toEqual({ ok: false, error: 'damaged' });
      expect(decodeSchedule(code.slice(0, -1))).toEqual({ ok: false, error: 'damaged' });
      expect(decodeSchedule('WL1:BB8')).toEqual({ ok: false, error: 'damaged' });
      expect(decodeSchedule('WL1:abc')).toEqual({ ok: false, error: 'damaged' });
    });

    it('a single flipped bit', () => {
      const raw = decodeBase45(code.slice(4)) ?? new Uint8Array();
      for (let i = 0; i < raw.length * 8; i += 7) {
        const flipped = Uint8Array.from(raw);
        flipped[i >> 3] = (flipped[i >> 3] ?? 0) ^ (1 << (i & 7));
        expect(decodeSchedule(`WL1:${encodeBase45(flipped)}`)).toEqual({
          ok: false,
          error: 'damaged',
        });
      }
    });

    /** A well-formed code (valid CRC) around hand-made content. */
    const forge = (write: (w: BitWriter) => void) => {
      const w = new BitWriter();
      write(w);
      const body = w.bytes();
      const crc = crc16(body);
      return `WL1:${encodeBase45(Uint8Array.from([...body, crc >> 8, crc & 0xff]))}`;
    };
    const header = (w: BitWriter, version = 1, count = 1) => {
      w.write(version, 8);
      w.write(0, 2);
      w.write(count, 6);
      w.write(0, 8); // label
      w.write(0, 8); // prepared by
      w.write(0, 16); // date
    };
    const medicineBits = (w: BitWriter, { form = 0, qty = 1, max = 4, amount = 7 } = {}) => {
      w.write(form, 3);
      w.write(0, 4);
      w.write(0, 4);
      w.write(0, 1);
      w.write(qty, 4);
      w.write(0, 2);
      w.write(0b100000, 6);
      w.write(2, 2);
      w.write(max, 3);
      w.write(0, 1);
      w.write(0, 1);
      w.write(amount, 7);
      w.write(0, 7);
      w.write(0, 8); // name
    };

    it('accepts a hand-made valid code (so the cases below fail for their own reason)', () => {
      const result = decodeSchedule(
        forge((w) => {
          header(w);
          medicineBits(w);
        }),
      );
      expect(result.ok).toBe(true);
    });

    it('a newer format inside a version-1 code', () => {
      expect(
        decodeSchedule(
          forge((w) => {
            header(w, 2, 0);
          }),
        ),
      ).toEqual({
        ok: false,
        error: 'newer-version',
      });
    });

    it('fields out of range', () => {
      const cases = [
        { form: 7 }, // no seventh form
        { qty: 15 }, // past the form's quantity steps
        { max: 0 }, // at most 0 a day
        { max: 7 },
        { amount: 120 }, // longer than 90
      ];
      for (const fields of cases) {
        const code = forge((w) => {
          header(w);
          medicineBits(w, fields);
        });
        expect(decodeSchedule(code), JSON.stringify(fields)).toEqual({
          ok: false,
          error: 'invalid',
        });
      }
    });

    it('a version of 0, missing medicines, trailing data and broken text', () => {
      expect(
        decodeSchedule(
          forge((w) => {
            header(w, 0, 0);
          }),
        ),
      ).toEqual({ ok: false, error: 'invalid' });
      expect(
        decodeSchedule(
          forge((w) => {
            header(w, 1, 2);
            medicineBits(w);
          }),
        ),
      ).toEqual({
        ok: false,
        error: 'invalid',
      });
      expect(
        decodeSchedule(
          forge((w) => {
            header(w, 1, 0);
            w.write(0xff, 8);
          }),
        ),
      ).toEqual({ ok: false, error: 'invalid' });
      const badUtf8 = forge((w) => {
        w.write(1, 8);
        w.write(0, 8);
        w.write(1, 8);
        w.write(0xff, 8); // not UTF-8
        w.write(0, 8);
        w.write(0, 16);
      });
      expect(decodeSchedule(badUtf8)).toEqual({ ok: false, error: 'invalid' });
    });
  });
});
