import type { PillColor } from './colors';
import { newId } from './id';
import type { PillForm } from './pillUnits';
import type { Medicine } from './types';

/** The quantities each form offers, from the Pill Builder's stepper. */
export const QTY_STEPS: Record<PillForm, readonly number[]> = {
  tablet: [0.5, 1, 1.5, 2, 2.5, 3, 4],
  oval: [0.5, 1, 1.5, 2, 3],
  capsule: [1, 2, 3, 4],
  liquid: [2.5, 5, 7.5, 10, 15, 20],
  drops: [1, 2, 3, 4, 5, 6, 8, 10],
  inhaler: [1, 2, 3, 4],
};

/** The quantity a form starts at: one of anything, or one 5 ml spoon of liquid. */
export const defaultQty = (form: PillForm): number => (form === 'liquid' ? 5 : 1);

/** Only tablets and ovals can have a score line. */
export const canHaveScore = (form: PillForm): boolean => form === 'tablet' || form === 'oval';

/** Only a capsule has two colours, a cap and a body. */
export const hasTwoColors = (form: PillForm): boolean => form === 'capsule';

/** Liquids and drops are coloured by what's in the bottle. */
export const isLiquidForm = (form: PillForm): boolean => form === 'liquid' || form === 'drops';

export function newMedicine(id: string = newId()): Medicine {
  return {
    id,
    name: '',
    form: 'tablet',
    color: 'white',
    color2: 'white',
    score: false,
    qty: defaultQty('tablet'),
    timing: { mode: 'fixed', doses: [], everyHours: 8, maxPerDay: 4 },
    course: { ongoing: false, amount: null, unit: 'days' },
    rules: [],
  };
}

/** A new form starts at its own default quantity; a score line only survives on tablets and ovals. */
export function changeForm(medicine: Medicine, form: PillForm): Medicine {
  return {
    ...medicine,
    form,
    qty: defaultQty(form),
    score: canHaveScore(form) && medicine.score,
  };
}

/** Where the quantity sits on its form's steps (the first step if it isn't one). */
export function qtyIndex(form: PillForm, qty: number): number {
  return Math.max(0, QTY_STEPS[form].indexOf(qty));
}

export function canStepQty(medicine: Medicine, direction: 1 | -1): boolean {
  const next = qtyIndex(medicine.form, medicine.qty) + direction;
  return next >= 0 && next < QTY_STEPS[medicine.form].length;
}

/** One step more or less; stays put at either end. */
export function stepQty(medicine: Medicine, direction: 1 | -1): Medicine {
  const qty = QTY_STEPS[medicine.form][qtyIndex(medicine.form, medicine.qty) + direction];
  return qty === undefined ? medicine : { ...medicine, qty };
}

export type ColorPart = 'cap' | 'body';

/** Sets the colour; on a capsule, `part` picks the cap or the body. */
export function setColor(medicine: Medicine, color: PillColor, part: ColorPart = 'cap'): Medicine {
  return hasTwoColors(medicine.form) && part === 'body'
    ? { ...medicine, color2: color }
    : { ...medicine, color };
}

export function setScore(medicine: Medicine, score: boolean): Medicine {
  return { ...medicine, score: canHaveScore(medicine.form) && score };
}
