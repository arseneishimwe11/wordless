// @vitest-environment node
import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';

import { decodeSchedule, encodeSchedule, sheetFor, type Medicine, type Person } from '@/domain';
import { amoxicillin, medicine, paracetamol } from '@/test/fixtures';

import { columns, days, paginate, PAGE, rowHeight } from './layout';
import { qrModules } from './ScheduleQr';
import { finishedSentence } from './sentence';
import { activeOn, MAX_STRIP_DAYS, stripDays } from './strips';

const person = (medicines: Medicine[]): Person => ({
  id: 'p',
  label: 'Grandmother',
  mark: 'a',
  medicines,
});

describe('fridge sheet layout (FridgeSheet.dc.html)', () => {
  it('places the design’s example exactly where the design does, on one page', () => {
    const sheet = sheetFor(person([amoxicillin(), paracetamol({ id: 'm2' })]));
    const pages = paginate(sheet, [false, false]);
    expect(pages).toEqual([
      {
        rows: [
          { index: 0, top: 206, height: 150 },
          { index: 1, top: 364, height: 120 },
        ],
        ruleTop: 492,
        tracks: [
          { index: 0, top: 566, height: 188 },
          { index: 1, top: 772, height: 58 },
        ],
      },
    ]);
    expect(PAGE).toEqual({ width: 794, height: 1123 });
  });

  it('shares the columns and the days like the design', () => {
    expect(columns(4).map((c) => [c.left, c.width])).toEqual([
      [232, 124.5],
      [364.5, 124.5],
      [497, 124.5],
      [629.5, 124.5],
    ]);
    expect(days(7)).toMatchObject({ box: 34, number: 32 });
    expect(days(7).centers[0]).toBe(234);
    expect(days(14).box).toBe(23);
  });

  it('shrinks the rows as medicines are added', () => {
    const rows = sheetFor(person([amoxicillin(), amoxicillin(), amoxicillin()])).rows;
    expect(rowHeight(rows[0] ?? never(), 3)).toBe(110);
    expect(rowHeight(rows[0] ?? never(), 6)).toBe(92);
  });

  it('moves the boxes to a second page when they don’t fit, never leaving an empty rule', () => {
    const many = [0, 1, 2, 3].map((i) =>
      amoxicillin({ id: `m${String(i)}`, course: { amount: 3, unit: 'weeks' } }),
    );
    const sheet = sheetFor(person(many));
    const pages = paginate(sheet, [true, true, true, true]);
    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) {
      expect(page.ruleTop === null).toBe(page.tracks.length === 0);
      for (const track of page.tracks) expect(track.top + track.height).toBeLessThanOrEqual(838);
    }
    expect(pages.flatMap((p) => p.tracks.map((t) => t.index))).toEqual([0, 1, 2, 3]);
    expect(pages.flatMap((p) => p.rows.map((r) => r.index))).toEqual([0, 1, 2, 3]);
  });

  it('spills medicine rows over to a page of their own when there are a great many', () => {
    const lots = Array.from({ length: 12 }, (_, i) =>
      amoxicillin({ id: `m${String(i)}`, course: { ongoing: true } }),
    );
    const pages = paginate(
      sheetFor(person(lots)),
      lots.map(() => true),
    );
    expect(pages[0]?.rows.length).toBeLessThan(12);
    expect(pages.flatMap((p) => p.rows.map((r) => r.index))).toHaveLength(12);
  });

  it('puts an over-tall track on a continuation page by itself', () => {
    const tall = amoxicillin({
      timing: { doses: ['sunrise', 'midMorning', 'midday', 'afternoon', 'sunset', 'night'] },
    });
    const pages = paginate(sheetFor(person([tall, tall, tall, tall, tall])), [
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(pages.every((p) => p.tracks.length <= 2)).toBe(true);
  });
});

describe('the finished sentence', () => {
  it('names whole tablets and capsules, and says “this medicine” otherwise', () => {
    expect(finishedSentence([amoxicillin()])).toBe(
      'The capsules are finished when every box is ticked — even if the patient feels better.',
    );
    expect(finishedSentence([amoxicillin({ form: 'tablet' }), paracetamol()])).toMatch(
      /^The tablets are finished/,
    );
    expect(finishedSentence([amoxicillin({ form: 'liquid', qty: 5 })])).toMatch(
      /^This medicine is finished/,
    );
    expect(finishedSentence([paracetamol()])).toMatch(/^This medicine is finished/);
    expect(finishedSentence([amoxicillin(), amoxicillin({ id: 'm2' })])).toMatch(
      /^Each medicine is finished/,
    );
    expect(finishedSentence([amoxicillin({ course: { ongoing: true } })])).toMatch(
      /^There is no end date/,
    );
  });
});

describe('daily strips', () => {
  it('cover the longest course, a week with no end date, up to four weeks', () => {
    expect(stripDays([amoxicillin()])).toBe(7);
    expect(stripDays([amoxicillin({ course: { amount: 2, unit: 'weeks' } }), paracetamol()])).toBe(
      14,
    );
    expect(stripDays([paracetamol()])).toBe(7);
    expect(stripDays([amoxicillin({ course: { amount: 90 } })])).toBe(MAX_STRIP_DAYS);
    expect(activeOn(amoxicillin({ course: { amount: 5 } }), 6)).toBe(false);
    expect(activeOn(paracetamol(), 60)).toBe(true);
  });
});

describe('the QR code', () => {
  it('draws modules that a scanner reads back into the same schedule', () => {
    const p = person([amoxicillin(), paracetamol({ id: 'm2' }), medicine({ name: 'Ñandú 💊' })]);
    const text = encodeFor(p);
    const { size, path } = qrModules(text);
    // Paint the path's 1×1 squares, 4 px each, onto white, then scan.
    const scale = 4;
    const width = size * scale;
    const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
    for (const [, x, y] of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const at = ((Number(y) * scale + dy) * width + Number(x) * scale + dx) * 4;
          pixels[at] = 0;
          pixels[at + 1] = 0;
          pixels[at + 2] = 0;
        }
      }
    }
    const scanned = jsQR(pixels, width, width);
    expect(scanned?.data).toBe(text);
    const decoded = decodeSchedule(scanned?.data ?? '');
    expect(decoded.ok && decoded.person.medicines.map((m) => m.name)).toEqual([
      'Amoxicillin 500 mg',
      'Paracetamol',
      'Ñandú 💊',
    ]);
  });
});

const encodeFor = (p: Person) => encodeSchedule(p, { preparedBy: '', preparedOn: '2026-11-25' });
function never(): never {
  throw new Error('missing');
}
