/**
 * Medicines as the design boards start them (AddMedicine, SunArc, HowLong and
 * LiveSheet initial states), for golden tests.
 */
import { newMedicine, type Medicine } from '@/domain';

type MedicineOverrides = Partial<Omit<Medicine, 'timing' | 'course'>> & {
  timing?: Partial<Medicine['timing']>;
  course?: Partial<Medicine['course']>;
};

export function medicine(overrides: MedicineOverrides = {}): Medicine {
  const base = newMedicine('m1');
  const { timing, course, ...rest } = overrides;
  return {
    ...base,
    ...rest,
    timing: { ...base.timing, ...timing },
    course: { ...base.course, ...course },
  };
}

/** The design's main example: a 7-day course, three times a day, with food. */
export const amoxicillin = (overrides: MedicineOverrides = {}): Medicine =>
  medicine({
    name: 'Amoxicillin 500 mg',
    form: 'capsule',
    color: 'red',
    color2: 'yellow',
    qty: 1,
    timing: { mode: 'fixed', doses: ['sunrise', 'midday', 'sunset'] },
    course: { amount: 7 },
    rules: ['withFood'],
    ...overrides,
  });

export const paracetamol = (overrides: MedicineOverrides = {}): Medicine =>
  medicine({
    name: 'Paracetamol',
    form: 'tablet',
    color: 'white',
    color2: 'white',
    score: true,
    qty: 1,
    timing: { mode: 'whenNeeded', maxPerDay: 4 },
    course: { ongoing: true },
    ...overrides,
  });

/** The Pill Builder board's six initial states. */
export const builderStates = {
  amox: amoxicillin(),
  para: paracetamol(),
  half: medicine({ name: '[TABLET NAME]', score: true, qty: 0.5 }),
  liquid: medicine({
    name: '[SYRUP NAME]',
    form: 'liquid',
    color: 'pink',
    color2: 'pink',
    qty: 7.5,
  }),
  drops: medicine({
    name: '[DROPS NAME]',
    form: 'drops',
    color: 'orange',
    color2: 'orange',
    qty: 2,
  }),
  inhaler: medicine({
    name: '[INHALER NAME]',
    form: 'inhaler',
    color: 'blue',
    color2: 'blue',
    qty: 2,
  }),
} satisfies Record<string, Medicine>;
