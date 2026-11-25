/**
 * Golden tests: each expected string is what the design board's own script
 * produces for that state (the scripts were run in Node to get them).
 */
import { describe, expect, it } from 'vitest';

import { copy } from '@/copy/en';
import { amoxicillin, builderStates, medicine, paracetamol } from '@/test/fixtures';

import {
  builderSummary,
  clockTimes,
  colorLabel,
  formatHalves,
  householdRow,
  howLongSummary,
  quantity,
  quantityParts,
  railSummaries,
  rulesText,
  sheetNote,
  timesList,
  whenCount,
  whenSummary,
} from './wording';

const c = copy.domain;

describe('Pill Builder (AddMedicine.dc.html)', () => {
  it.each([
    ['amox', '1 capsule · red cap, yellow body', '1', 'capsule', 'Color'],
    ['para', '1 tablet · white, score line', '1', 'tablet', 'Color'],
    ['half', '½ tablet · white, score line', '½', 'tablet', 'Color'],
    ['liquid', '7.5 ml, 1½ spoons of 5 ml · pink', '7.5', 'ml', 'Color of the liquid'],
    ['drops', '2 drops · orange', '2', 'drops', 'Color of the liquid'],
    ['inhaler', '2 puffs · blue inhaler', '2', 'puffs', 'Color'],
  ] as const)('%s: "%s"', (state, summary, value, unit, label) => {
    const m = builderStates[state];
    expect(builderSummary(m, c)).toBe(summary);
    expect(quantityParts(m.form, m.qty, c)).toEqual({ value, unit });
    expect(colorLabel(m.form, c)).toBe(label);
  });

  it('describes ovals, unscored tablets and capsule plurals', () => {
    expect(builderSummary(medicine({ form: 'oval', qty: 1.5, color: 'blue' }), c)).toBe(
      '1½ tablets · blue, oval',
    );
    expect(builderSummary(medicine({ form: 'tablet', qty: 2 }), c)).toBe('2 tablets · white');
    expect(builderSummary(amoxicillin({ qty: 3 }), c)).toBe('3 capsules · red cap, yellow body');
    expect(builderSummary(medicine({ form: 'liquid', qty: 2.5 }), c)).toBe(
      '2.5 ml, ½ spoon of 5 ml · white',
    );
    expect(builderSummary(medicine({ form: 'liquid', qty: 10 }), c)).toBe(
      '10 ml, 2 spoons of 5 ml · white',
    );
    expect(quantity(medicine({ form: 'drops', qty: 1 }), c)).toBe('1 drop');
    expect(quantity(medicine({ form: 'inhaler', qty: 1 }), c)).toBe('1 puff');
  });

  it('writes halves with the ½ sign', () => {
    expect(formatHalves(0.5, c)).toBe('½');
    expect(formatHalves(2.5, c)).toBe('2½');
    expect(formatHalves(3, c)).toBe('3');
  });
});

describe('sun arc (SunArc.dc.html)', () => {
  const empty = amoxicillin({ timing: { mode: 'fixed', doses: [] } });
  const fixed3 = amoxicillin();
  const every8 = amoxicillin({
    timing: { mode: 'every', everyHours: 8, doses: ['sunrise', 'afternoon', 'night'] },
  });
  const prn = paracetamol();

  it('empty', () => {
    expect(whenSummary(empty, c)).toEqual({
      title: 'No times yet',
      detail: 'Tap a time on the sky, or choose how many a day.',
      tone: 'normal',
    });
    expect(whenSummary(empty, c, { error: true })).toEqual({
      title: 'Add at least one time first',
      detail: 'Tap a time on the sky, or choose how many a day.',
      tone: 'error',
    });
    expect(whenCount(empty, c)).toEqual({ big: '0', small: 'a day' });
  });

  it('fixed3', () => {
    expect(whenSummary(fixed3, c)).toEqual({
      title: 'Sunrise, midday and sunset',
      detail: '1 capsule each time · about 6 am · 12 noon · 6 pm',
      tone: 'normal',
    });
    expect(whenSummary(fixed3, c, { error: true }).tone).toBe('normal');
    expect(whenCount(fixed3, c)).toEqual({ big: '3', small: 'a day' });
  });

  it('every8', () => {
    expect(whenSummary(every8, c)).toEqual({
      title: 'Every 8 h: sunrise, afternoon and night',
      detail: 'about 6 am · 3 pm · 10 pm',
      tone: 'normal',
    });
    expect(whenCount(every8, c)).toEqual({ big: '8 h', small: 'apart · 3 a day' });
  });

  it('prn', () => {
    expect(whenSummary(prn, c)).toEqual({
      title: 'Only when needed',
      detail: '1 tablet at a time, never more than 4 in a day',
      tone: 'normal',
    });
    expect(whenCount(prn, c)).toEqual({ big: 'up to 4', small: 'a day, if needed' });
  });

  it('drops the quantity on a phone from four times a day, and summarises more than four', () => {
    const four = amoxicillin({
      timing: { doses: ['sunrise', 'midday', 'sunset', 'night'] },
    });
    expect(whenSummary(four, c)).toMatchObject({
      title: 'Sunrise, midday, sunset and night',
      detail: 'about 6 am · 12 noon · 6 pm · 10 pm',
    });
    const six = amoxicillin({
      timing: {
        doses: ['sunrise', 'midMorning', 'midday', 'afternoon', 'sunset', 'night'],
      },
    });
    expect(whenSummary(six, c)).toMatchObject({
      title: '6 times, sunrise to night',
      detail: 'about 6 am · 9 am · 12 noon · 3 pm · 6 pm · 10 pm',
    });
    const one = amoxicillin({ timing: { doses: ['night'] } });
    expect(whenSummary(one, c)).toMatchObject({
      title: 'Night',
      detail: '1 capsule each time · about 10 pm',
    });
  });

  it('every N with no doses left reads as empty', () => {
    const none = amoxicillin({ timing: { mode: 'every', doses: [] } });
    expect(whenCount(none, c)).toEqual({ big: '0', small: 'a day' });
  });
});

describe('desktop entry (DesktopEntry.dc.html)', () => {
  it('when: always names the quantity, and the desktop hint', () => {
    expect(whenSummary(amoxicillin(), c, { variant: 'desktop' }).detail).toBe(
      '1 capsule each time · about 6 am · 12 noon · 6 pm',
    );
    const inhaler = medicine({
      form: 'inhaler',
      qty: 2,
      timing: { doses: ['sunrise', 'midday', 'sunset', 'night'] },
    });
    expect(whenSummary(inhaler, c, { variant: 'desktop' }).detail).toBe(
      '2 puffs each time · about 6 am · 12 noon · 6 pm · 10 pm',
    );
    expect(
      whenSummary(amoxicillin({ timing: { doses: [] } }), c, { variant: 'desktop' }).detail,
    ).toBe('Click a time on the sky, drag the sun, or press 1–4.');
    const tabs = medicine({ qty: 1.5, timing: { doses: ['sunrise', 'midday', 'sunset'] } });
    expect(whenSummary(tabs, c, { variant: 'desktop' }).detail).toBe(
      '1½ tablets each time · about 6 am · 12 noon · 6 pm',
    );
  });

  it('how long: filled, ongoing, missing, when needed', () => {
    const d = { variant: 'desktop' } as const;
    expect(howLongSummary(amoxicillin(), c, d)).toEqual({
      title: '7 days · 21 doses in all',
      detail: 'The sheet now shows 21 boxes to tick, grouped by day.',
      note: 'done when the boxes are done →',
      tone: 'normal',
    });
    expect(howLongSummary(amoxicillin({ course: { ongoing: true } }), c, d)).toEqual({
      title: 'No end date',
      detail: 'The sheet shows one week to repeat, with no finish stamp.',
      note: 'one week of boxes, on the sheet →',
      tone: 'normal',
    });
    const missing = amoxicillin({ course: { amount: null } });
    expect(howLongSummary(missing, c, d)).toEqual({
      title: 'How long is missing',
      detail: 'Type a number and press Enter, or pick a usual length.',
      note: 'type a number — the boxes appear on the sheet →',
      tone: 'normal',
    });
    expect(howLongSummary(missing, c, { ...d, error: true })).toEqual({
      title: 'Add how long first',
      detail: 'Type a number and press Enter, or pick a usual length.',
      note: 'the boxes need an end before they can be ticked',
      tone: 'error',
    });
    expect(howLongSummary(paracetamol({ course: { ongoing: false, amount: 7 } }), c, d)).toEqual({
      title: '7 days',
      detail: 'Only when needed: the sheet shows a dashed tally for each day.',
      note: 'done when the boxes are done →',
      tone: 'normal',
    });
  });

  it('rail summaries, step by step', () => {
    const entering = amoxicillin({ timing: { doses: [] }, course: { amount: null }, rules: [] });
    expect(railSummaries(entering, c)).toEqual([
      'Amoxicillin 500 mg · 1 capsule, red and yellow',
      '—',
      '—',
      '—',
    ]);
    expect(railSummaries(amoxicillin({ rules: [] }), c)).toEqual([
      'Amoxicillin 500 mg · 1 capsule, red and yellow',
      'sunrise, midday and sunset',
      '7 days',
      '—',
    ]);
    expect(railSummaries(amoxicillin({ rules: [] }), c, { rulesReached: true })[3]).toBe('none');
    expect(railSummaries(amoxicillin(), c)[3]).toBe('with food');
    expect(railSummaries(amoxicillin({ course: { ongoing: true } }), c)[2]).toBe('no end date');
    expect(railSummaries(paracetamol(), c)[1]).toBe('only when needed');

    const tablets = amoxicillin({
      form: 'tablet',
      qty: 1.5,
      color: 'white',
      rules: ['withFood', 'keepCool'],
    });
    expect(railSummaries(tablets, c)).toEqual([
      'Amoxicillin 500 mg · 1½ tablets, white',
      'sunrise, midday and sunset',
      '7 days',
      'with food, keep cool',
    ]);
    expect(railSummaries(amoxicillin({ form: 'liquid', qty: 7.5, color: 'pink' }), c)[0]).toBe(
      'Amoxicillin 500 mg · 7.5 ml, pink',
    );
    expect(railSummaries(medicine({ name: 'X', form: 'inhaler', qty: 2 }), c)[0]).toBe(
      'X · 2 puffs',
    );
    // The design writes " · 2 drops" with no name; a missing name is simply left out.
    expect(railSummaries(medicine({ form: 'drops', qty: 2 }), c)[0]).toBe('2 drops');
    expect(railSummaries(amoxicillin({ course: { amount: 3, unit: 'weeks' } }), c)[2]).toBe(
      '21 days',
    );
  });
});

describe('how long (HowLong.dc.html)', () => {
  it('filled', () => {
    expect(howLongSummary(amoxicillin(), c)).toEqual({
      title: '7 days · 21 capsules in all',
      detail: 'The sheet will show 21 boxes to tick, grouped by day.',
      note: 'done when the boxes are done',
      tone: 'normal',
    });
  });

  it('missing, before and after trying to continue', () => {
    const missing = amoxicillin({ course: { amount: null } });
    expect(howLongSummary(missing, c)).toEqual({
      title: 'How long is missing',
      detail: 'Type a number, or pick one of the usual lengths.',
      note: 'how many days? the boxes need an end before they can be ticked',
      tone: 'normal',
    });
    expect(howLongSummary(missing, c, { error: true })).toEqual({
      title: 'Add how long first',
      detail: 'Type a number, or pick one of the usual lengths.',
      note: 'how many days? the boxes need an end before they can be ticked',
      tone: 'error',
    });
  });

  it('ongoing', () => {
    expect(howLongSummary(amoxicillin({ course: { ongoing: true } }), c)).toEqual({
      title: 'Ongoing · 3 a day, no end date',
      detail: 'Keep going until the prescriber says stop.',
      note: 'no end date — the sheet shows one week; print a new one when it is full',
      tone: 'normal',
    });
    expect(howLongSummary(paracetamol(), c).title).toBe('Ongoing · only when needed, no end date');
  });

  it('weeks, a single day, and more days than the grid shows', () => {
    expect(howLongSummary(amoxicillin({ course: { amount: 3, unit: 'weeks' } }), c)).toEqual({
      title: '21 days · 63 capsules in all',
      detail: 'The sheet will show 63 boxes to tick, grouped by day.',
      note: 'done when the boxes are done — and 7 more days like these',
      tone: 'normal',
    });
    expect(howLongSummary(amoxicillin({ course: { amount: 1 } }), c).title).toBe(
      '1 day · 3 capsules in all',
    );
  });

  it('counts whole tablets and capsules, and doses of anything else', () => {
    expect(howLongSummary(amoxicillin({ qty: 2 }), c).title).toBe('7 days · 42 capsules in all');
    expect(howLongSummary(amoxicillin({ form: 'tablet', qty: 1 }), c).title).toBe(
      '7 days · 21 tablets in all',
    );
    expect(howLongSummary(amoxicillin({ form: 'tablet', qty: 0.5 }), c).title).toBe(
      '7 days · 21 doses in all',
    );
    expect(
      howLongSummary(
        amoxicillin({
          form: 'liquid',
          qty: 5,
          course: { amount: 1 },
          timing: { doses: ['night'] },
        }),
        c,
      ).title,
    ).toBe('1 day · 1 dose in all');
    expect(howLongSummary(paracetamol({ course: { ongoing: false, amount: 5 } }), c)).toMatchObject(
      {
        title: '5 days',
        detail: 'Only when needed: the sheet shows a dashed tally for each day.',
      },
    );
  });
});

describe('household rows (Household.dc.html)', () => {
  it('reads as the design', () => {
    expect(householdRow(amoxicillin(), c)).toBe('3 a day · 7 days · with food');
    expect(householdRow(paracetamol(), c)).toBe('only when needed · at most 4 a day');
  });

  it('covers the other lengths', () => {
    expect(householdRow(amoxicillin({ course: { ongoing: true }, rules: [] }), c)).toBe(
      '3 a day · no end date',
    );
    expect(householdRow(amoxicillin({ course: { amount: null }, rules: [] }), c)).toBe('3 a day');
    expect(householdRow(paracetamol({ course: { ongoing: false, amount: 5 } }), c)).toBe(
      'only when needed · at most 4 a day · 5 days',
    );
  });
});

describe('sheet notes (LiveSheet.dc.html)', () => {
  it('reads as the design', () => {
    expect(sheetNote(amoxicillin(), c)).toBeNull();
    expect(sheetNote(amoxicillin({ course: { amount: 3, unit: 'weeks' } }), c)).toBe(
      '+ 7 more days like these',
    );
    expect(sheetNote(amoxicillin({ course: { ongoing: true } }), c)).toBe(
      'no end date: one week to repeat',
    );
    expect(sheetNote(amoxicillin({ course: { amount: null } }), c)).toBe(
      'how long? the boxes appear here',
    );
  });
});

describe('lists', () => {
  it('joins times and rules', () => {
    expect(timesList([], c)).toBe('');
    expect(timesList(['sunset'], c)).toBe('sunset');
    expect(timesList(['sunrise', 'sunset'], c)).toBe('sunrise and sunset');
    expect(clockTimes(['midMorning', 'afternoon'], c)).toBe('about 9 am · 3 pm');
    expect(rulesText(['noAlcohol', 'sleepiness', 'shakeFirst'], c)).toBe(
      'no alcohol, may cause sleepiness, shake first',
    );
  });
});
