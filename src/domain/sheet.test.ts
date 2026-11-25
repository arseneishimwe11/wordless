/** Golden tests against the live sheet (LiveSheet.dc.html) and the print edge cases board. */
import { describe, expect, it } from 'vitest';

import { amoxicillin, medicine, paracetamol } from '@/test/fixtures';

import { keyUnit, sheetColumns, sheetFor, type CourseGrid, type ScheduledRow } from './sheet';

describe('sheetFor', () => {
  it('the default schedule: amoxicillin three times a day for 7 days, with food', () => {
    const sheet = sheetFor({ medicines: [amoxicillin(), paracetamol()] });
    expect(sheet.columns).toEqual(['sunrise', 'midday', 'sunset', 'night']);

    const [amox, para] = sheet.rows;
    expect(amox).toMatchObject({ kind: 'scheduled', keyUnit: 'capsule', rules: ['withFood'] });
    expect((amox as ScheduledRow).cells).toEqual([
      { time: 'sunrise', dose: true, units: ['capsule'], withFood: true },
      { time: 'midday', dose: true, units: ['capsule'], withFood: true },
      { time: 'sunset', dose: true, units: ['capsule'], withFood: true },
      { time: 'night', dose: false, units: [], withFood: false },
    ]);
    expect(para).toMatchObject({
      kind: 'whenNeeded',
      keyUnit: 'tablet',
      units: ['tablet'],
      maxPerDay: 4,
    });

    const [grid, tally] = sheet.tracks;
    expect(grid).toEqual({
      kind: 'grid',
      medicineId: 'm1',
      days: [1, 2, 3, 4, 5, 6, 7],
      rows: [
        { time: 'sunrise', box: 'solid' },
        { time: 'midday', box: 'solid' },
        { time: 'sunset', box: 'solid' },
      ],
      faded: false,
      extraDays: 0,
      end: 'stamp',
    });
    expect(tally).toEqual({
      kind: 'tally',
      medicineId: 'm1',
      days: [1, 2, 3, 4, 5, 6, 7],
      perDay: 4,
      end: 'repeat',
    });
  });

  it('every 8 h: the columns follow the doses (print edge cases board)', () => {
    const every8 = medicine({
      form: 'tablet',
      color: 'yellow',
      timing: { mode: 'every', everyHours: 8, doses: ['sunrise', 'afternoon', 'night'] },
      course: { amount: 5 },
    });
    expect(sheetColumns([every8])).toEqual(['sunrise', 'afternoon', 'night']);
    const row = sheetFor({ medicines: [every8] }).rows[0] as ScheduledRow;
    expect(row.cells.map((cell) => cell.dose)).toEqual([true, true, true]);
    // Mixed with a base-time medicine, every dose time gets its column.
    expect(sheetColumns([every8, amoxicillin()])).toEqual([
      'sunrise',
      'midday',
      'afternoon',
      'sunset',
      'night',
    ]);
  });

  it('only when needed: a tally of the most a day, no rows of boxes', () => {
    const sheet = sheetFor({ medicines: [paracetamol({ course: { ongoing: false, amount: 5 } })] });
    expect(sheet.columns).toEqual(['sunrise', 'midday', 'sunset', 'night']);
    expect(sheet.tracks).toEqual([
      { kind: 'tally', medicineId: 'm1', days: [1, 2, 3, 4, 5], perDay: 4, end: null },
    ]);
  });

  it('missing length and no times yet: one faded week of dashed boxes', () => {
    const entering = amoxicillin({ timing: { doses: [] }, course: { amount: null } });
    const sheet = sheetFor({ medicines: [entering] });
    expect((sheet.rows[0] as ScheduledRow).noTimes).toBe(true);
    expect(sheet.tracks[0]).toEqual({
      kind: 'grid',
      medicineId: 'm1',
      days: [null, null, null, null, null, null, null],
      rows: [{ time: 'sunrise', box: 'dashed' }],
      faded: true,
      extraDays: 0,
      end: null,
    });
    const timesOnly = sheetFor({ medicines: [amoxicillin({ course: { amount: null } })] });
    expect((timesOnly.tracks[0] as CourseGrid).rows.map((r) => r.box)).toEqual([
      'dashed',
      'dashed',
      'dashed',
    ]);
  });

  it('long and ongoing courses', () => {
    const long = sheetFor({ medicines: [amoxicillin({ course: { amount: 3, unit: 'weeks' } })] });
    expect(long.tracks[0]).toMatchObject({ extraDays: 7, end: 'stamp' });
    expect((long.tracks[0] as CourseGrid).days).toHaveLength(14);
    const ongoing = sheetFor({ medicines: [amoxicillin({ course: { ongoing: true } })] });
    expect(ongoing.tracks[0]).toMatchObject({ end: 'repeat', faded: false });
    expect((ongoing.tracks[0] as CourseGrid).days).toHaveLength(7);
  });

  it('draws each dose unit by unit', () => {
    const syrup = medicine({ form: 'liquid', qty: 7.5, timing: { doses: ['sunrise'] } });
    const row = sheetFor({ medicines: [syrup] }).rows[0] as ScheduledRow;
    expect(row.cells[0]?.units).toEqual(['spoon', 'spoon-half']);
  });

  it('starts each row with the medicine’s own drawing', () => {
    expect(keyUnit({ form: 'tablet', qty: 0.5 })).toBe('half');
    expect(keyUnit({ form: 'tablet', qty: 2 })).toBe('tablet');
    expect(keyUnit({ form: 'oval', qty: 0.5 })).toBe('oval');
    expect(keyUnit({ form: 'liquid', qty: 2.5 })).toBe('spoon');
    expect(keyUnit({ form: 'drops', qty: 2 })).toBe('dropper');
    expect(keyUnit({ form: 'inhaler', qty: 2 })).toBe('inhaler');
  });

  it('an empty sheet still has its four columns', () => {
    expect(sheetFor({ medicines: [] })).toEqual({
      columns: ['sunrise', 'midday', 'sunset', 'night'],
      rows: [],
      tracks: [],
    });
  });
});
