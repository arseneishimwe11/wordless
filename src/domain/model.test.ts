import { describe, expect, it } from 'vitest';

import { amoxicillin, medicine, paracetamol } from '@/test/fixtures';

import { nextFreeMark } from './household';
import {
  activeUsualLength,
  courseDays,
  extraDays,
  isMissing,
  isOngoing,
  parseAmount,
  pickUsualLength,
  setAmount,
  setOngoing,
  setUnit,
  shownDays,
  stepAmount,
} from './course';
import {
  canHaveScore,
  canStepQty,
  changeForm,
  defaultQty,
  hasTwoColors,
  isLiquidForm,
  newMedicine,
  QTY_STEPS,
  qtyIndex,
  setColor,
  setScore,
  stepQty,
} from './medicine';
import { clearRules, sortRules, toggleRule } from './rules';
import { householdSchema, medicineSchema } from './schema';
import {
  activeTimesADay,
  addDose,
  clearDoses,
  dosesPerDay,
  EVERY,
  nearestTime,
  placeTimesADay,
  scheduledDoses,
  setEvery,
  setMode,
  sortDoses,
  stepMaxPerDay,
  stepTime,
  sunTravelMs,
  TIMES,
  toggleDose,
} from './timing';
import { TIMES_OF_DAY, type Course, type Timing } from './types';
import { isComplete, stepIssue, stepIssues } from './validation';
import { newId } from './id';

describe('medicine', () => {
  it('starts blank', () => {
    const m = newMedicine('x');
    expect(m).toMatchObject({ id: 'x', name: '', form: 'tablet', qty: 1, rules: [] });
    expect(m.timing).toEqual({ mode: 'fixed', doses: [], everyHours: 8, maxPerDay: 4 });
    expect(m.course).toEqual({ ongoing: false, amount: null, unit: 'days' });
    expect(newMedicine().id).toMatch(/^[0-9a-f-]{36}$/);
    expect(newId()).not.toBe(newId());
  });

  it('offers the design’s quantity steps', () => {
    expect(QTY_STEPS.tablet).toEqual([0.5, 1, 1.5, 2, 2.5, 3, 4]);
    expect(QTY_STEPS.liquid).toEqual([2.5, 5, 7.5, 10, 15, 20]);
    expect(defaultQty('liquid')).toBe(5);
    expect(defaultQty('drops')).toBe(1);
  });

  it('changing form resets the quantity and keeps a score line only on tablets and ovals', () => {
    const scored = medicine({ score: true, qty: 2.5 });
    expect(changeForm(scored, 'oval')).toMatchObject({ form: 'oval', qty: 1, score: true });
    expect(changeForm(scored, 'capsule')).toMatchObject({ qty: 1, score: false });
    expect(changeForm(scored, 'liquid')).toMatchObject({ qty: 5, score: false });
    expect(setScore(medicine({ form: 'capsule' }), true).score).toBe(false);
    expect(setScore(medicine(), true).score).toBe(true);
    expect([canHaveScore('oval'), hasTwoColors('capsule'), isLiquidForm('drops')]).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('steps the quantity and stops at the ends', () => {
    const half = medicine({ qty: 0.5 });
    expect(canStepQty(half, -1)).toBe(false);
    expect(stepQty(half, -1)).toBe(half);
    expect(stepQty(half, 1).qty).toBe(1);
    const four = medicine({ qty: 4 });
    expect(canStepQty(four, 1)).toBe(false);
    expect(stepQty(four, 1)).toBe(four);
    expect(stepQty(four, -1).qty).toBe(3);
    // A quantity that isn't a step counts as the first step.
    expect(qtyIndex('capsule', 7)).toBe(0);
  });

  it('colours a capsule’s cap or body, and anything else as a whole', () => {
    const cap = amoxicillin();
    expect(setColor(cap, 'blue')).toMatchObject({ color: 'blue', color2: 'yellow' });
    expect(setColor(cap, 'blue', 'body')).toMatchObject({ color: 'red', color2: 'blue' });
    expect(setColor(medicine(), 'green', 'body')).toMatchObject({
      color: 'green',
      color2: 'white',
    });
  });
});

describe('timing', () => {
  const fixed = (doses: Timing['doses'] = []): Timing => ({
    mode: 'fixed',
    doses,
    everyHours: 8,
    maxPerDay: 4,
  });

  it('has the six stops on the arc', () => {
    expect(TIMES_OF_DAY.map((t) => TIMES[t].angle)).toEqual([172, 131, 90, 49, 8, -90]);
    expect(TIMES.afternoon.phase).toBe('midday');
    expect(EVERY[8]).toEqual(['sunrise', 'afternoon', 'night']);
  });

  it('keeps doses in day order, and toggling makes the timing fixed', () => {
    expect(sortDoses(['night', 'sunrise', 'night'])).toEqual(['sunrise', 'night']);
    const every = setEvery(fixed(), 8);
    expect(every).toMatchObject({ mode: 'every', doses: ['sunrise', 'afternoon', 'night'] });
    const changed = toggleDose(every, 'midday');
    expect(changed).toMatchObject({
      mode: 'fixed',
      doses: ['sunrise', 'midday', 'afternoon', 'night'],
    });
    expect(toggleDose(changed, 'midday').doses).toEqual(['sunrise', 'afternoon', 'night']);
  });

  it('dropping the sun adds a dose but never removes one', () => {
    expect(addDose(fixed(['sunset']), 'sunrise').doses).toEqual(['sunrise', 'sunset']);
    expect(addDose(fixed(['sunset']), 'sunset').doses).toEqual(['sunset']);
  });

  it('ignores the sky while when needed', () => {
    const prn = paracetamol().timing;
    expect(toggleDose(prn, 'sunrise')).toBe(prn);
    expect(addDose(prn, 'sunrise')).toBe(prn);
    expect(scheduledDoses({ ...prn, doses: ['sunrise'] })).toEqual([]);
    expect(dosesPerDay(prn)).toBe(0);
  });

  it('places the presets and knows which chip is on', () => {
    const three = placeTimesADay(fixed(), 3);
    expect(three.doses).toEqual(['sunrise', 'midday', 'sunset']);
    expect(activeTimesADay(three)).toBe(3);
    expect(activeTimesADay(fixed(['sunrise', 'night']))).toBeNull();
    expect(activeTimesADay(setEvery(fixed(), 12))).toBeNull();
  });

  it('switches mode, keeping each mode’s setting', () => {
    const every = setMode({ ...fixed(), everyHours: 12 }, 'every');
    expect(every).toMatchObject({ mode: 'every', doses: ['sunrise', 'sunset'] });
    const prn = setMode(every, 'whenNeeded');
    expect(prn).toMatchObject({ mode: 'whenNeeded', doses: ['sunrise', 'sunset'] });
    expect(setMode(prn, 'fixed')).toMatchObject({ mode: 'fixed', doses: ['sunrise', 'sunset'] });
  });

  it('clears the sky', () => {
    expect(clearDoses(setEvery(fixed(), 8))).toMatchObject({ mode: 'fixed', doses: [] });
    expect(clearDoses(paracetamol().timing).mode).toBe('whenNeeded');
  });

  it('caps "when needed" between 1 and 6 a day', () => {
    expect(stepMaxPerDay({ ...fixed(), maxPerDay: 6 }, 1).maxPerDay).toBe(6);
    expect(stepMaxPerDay({ ...fixed(), maxPerDay: 1 }, -1).maxPerDay).toBe(1);
    expect(stepMaxPerDay(fixed(), 1).maxPerDay).toBe(5);
  });

  it('snaps to the nearest stop and steps along the day', () => {
    expect(nearestTime(180)).toBe('sunrise');
    expect(nearestTime(100)).toBe('midday');
    expect(nearestTime(-20)).toBe('sunset');
    expect(nearestTime(-60)).toBe('night');
    expect(stepTime('sunrise', -1)).toBe('sunrise');
    expect(stepTime('sunrise', 1)).toBe('midMorning');
    expect(stepTime('night', 1)).toBe('night');
  });

  it('times the sun’s travel from the motion tokens', () => {
    expect(sunTravelMs(172, 172)).toBe(320);
    expect(sunTravelMs(172, 90)).toBeCloseTo(320 + 82 * 2.6);
    expect(sunTravelMs(172, -90)).toBe(950);
  });
});

describe('course', () => {
  const days = (amount: number | null, extra: Partial<Course> = {}): Course => ({
    ongoing: false,
    amount,
    unit: 'days',
    ...extra,
  });

  it('counts days, weeks, ongoing and missing', () => {
    expect(courseDays(days(7))).toBe(7);
    expect(courseDays(days(3, { unit: 'weeks' }))).toBe(21);
    expect(courseDays(days(7, { ongoing: true }))).toBeNull();
    expect(courseDays(days(null))).toBeNull();
    expect(isMissing(days(null))).toBe(true);
    expect(isMissing(days(null, { ongoing: true }))).toBe(false);
    expect(isOngoing(days(null, { ongoing: true }))).toBe(true);
  });

  it('shows up to two weeks of boxes, and one week when ongoing or missing', () => {
    expect(shownDays(days(5))).toBe(5);
    expect(shownDays(days(30))).toBe(14);
    expect(extraDays(days(30))).toBe(16);
    expect(extraDays(days(10))).toBe(0);
    expect(shownDays(days(null))).toBe(7);
    expect(shownDays(days(30, { ongoing: true }))).toBe(7);
    expect(extraDays(days(30, { ongoing: true }))).toBe(0);
  });

  it('takes a typed length from 1 to 90', () => {
    expect(parseAmount('12')).toBe(12);
    expect(parseAmount('400')).toBe(90);
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(setAmount(days(null, { ongoing: true }), 10)).toEqual(days(10));
    expect(setAmount(days(5), 0).amount).toBeNull();
    expect(setAmount(days(5), null).amount).toBeNull();
    expect(setAmount(days(5), 120).amount).toBe(90);
    expect(setAmount(days(5), 2.7).amount).toBe(2);
  });

  it('− and + start either side of a week, and stay within 1–90', () => {
    expect(stepAmount(days(null), -1).amount).toBe(7);
    expect(stepAmount(days(null), 1).amount).toBe(7);
    expect(stepAmount(days(1), -1).amount).toBe(1);
    expect(stepAmount(days(90), 1).amount).toBe(90);
    expect(stepAmount(days(7, { ongoing: true }), 1)).toEqual(days(8));
  });

  it('picks a usual length, and knows which one is on', () => {
    const picked = pickUsualLength(days(3, { unit: 'weeks', ongoing: true }), 10);
    expect(picked).toEqual(days(10));
    expect(activeUsualLength(picked)).toBe(10);
    expect(activeUsualLength(days(9))).toBeNull();
    expect(activeUsualLength(days(7, { unit: 'weeks' }))).toBeNull();
    expect(activeUsualLength(days(7, { ongoing: true }))).toBeNull();
  });

  it('"no end date" keeps the length for when it is turned off', () => {
    const ongoing = setOngoing(days(10), true);
    expect(ongoing).toEqual(days(10, { ongoing: true }));
    expect(setOngoing(ongoing, false)).toEqual(days(10));
    expect(setUnit(days(2), 'weeks').unit).toBe('weeks');
  });
});

describe('rules (Rules.dc.html)', () => {
  it('"with food" and "empty stomach" lift each other', () => {
    expect(toggleRule(['withFood'], 'emptyStomach')).toEqual(['emptyStomach']);
    expect(toggleRule(['emptyStomach', 'withWater'], 'withFood')).toEqual([
      'withFood',
      'withWater',
    ]);
  });

  it('adds in the screen’s order and removes on a second tap', () => {
    expect(toggleRule(['shakeFirst'], 'withWater')).toEqual(['withWater', 'shakeFirst']);
    expect(toggleRule(['withFood', 'keepCool'], 'withFood')).toEqual(['keepCool']);
    expect(sortRules(['keepCool', 'withFood'])).toEqual(['withFood', 'keepCool']);
    expect(clearRules()).toEqual([]);
  });
});

describe('validation (DesktopEntry.dc.html)', () => {
  it('needs a time and a length, except when needed has no times', () => {
    const blank = medicine();
    expect(stepIssue(blank, 'medicine')).toBeNull();
    expect(stepIssue(blank, 'when')).toBe('noTimes');
    expect(stepIssue(blank, 'howLong')).toBe('noLength');
    expect(stepIssue(blank, 'rules')).toBeNull();
    expect(stepIssues(blank)).toEqual(['noTimes', 'noLength']);
    expect(isComplete(blank)).toBe(false);
    expect(isComplete(amoxicillin())).toBe(true);
    expect(isComplete(paracetamol())).toBe(true);
    expect(stepIssues(amoxicillin({ timing: { mode: 'every', doses: [] } }))).toEqual(['noTimes']);
  });
});

describe('household marks', () => {
  it('gives the next free mark', () => {
    expect(nextFreeMark([])).toBe('a');
    expect(nextFreeMark(['a', 'c'])).toBe('b');
    expect(nextFreeMark(['a', 'b', 'c', 'd'])).toBeNull();
  });
});

describe('schemas', () => {
  it('accept the fixtures and reject impossible data', () => {
    const person = { id: 'p', label: 'A', mark: 'a', medicines: [amoxicillin()] } as const;
    expect(householdSchema.safeParse({ people: [person], preparedBy: '' }).success).toBe(true);
    // Two people can't share a mark: the marks are how sheets are told apart.
    expect(
      householdSchema.safeParse({ people: [person, { ...person, id: 'q' }], preparedBy: '' })
        .success,
    ).toBe(false);
    expect(medicineSchema.safeParse(amoxicillin({ qty: 1.5 })).success).toBe(false);
    expect(medicineSchema.safeParse(amoxicillin({ score: true })).success).toBe(false);
    expect(
      medicineSchema.safeParse(amoxicillin({ rules: ['withFood', 'emptyStomach'] })).success,
    ).toBe(false);
    expect(
      medicineSchema.safeParse(amoxicillin({ timing: { doses: ['night', 'night'] } })).success,
    ).toBe(false);
  });
});
