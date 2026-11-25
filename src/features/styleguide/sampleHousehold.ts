import { copy } from '@/copy/en';
import { newMedicine, type Medicine, type Person, type ScheduleMeta } from '@/domain';

const names = copy.styleguide.printables.names;

type Overrides = Partial<Omit<Medicine, 'timing' | 'course'>> & {
  timing?: Partial<Medicine['timing']>;
  course?: Partial<Medicine['course']>;
};

const medicine = (id: string, o: Overrides): Medicine => {
  const base = newMedicine(id);
  return {
    ...base,
    ...o,
    timing: { ...base.timing, ...o.timing },
    course: { ...base.course, ...o.course },
  };
};

/** The design's example: amoxicillin three times a day for a week, paracetamol when needed. */
export const samplePerson: Person = {
  id: 'sample',
  label: 'Grandmother',
  mark: 'a',
  medicines: [
    medicine('amox', {
      name: names.amoxicillin,
      form: 'capsule',
      color: 'red',
      color2: 'yellow',
      timing: { mode: 'fixed', doses: ['sunrise', 'midday', 'sunset'] },
      course: { amount: 7 },
      rules: ['withFood'],
    }),
    medicine('para', {
      name: names.paracetamol,
      score: true,
      timing: { mode: 'whenNeeded', maxPerDay: 4 },
      course: { ongoing: true },
    }),
  ],
};

/** The forms on PrintEdgeCases.dc.html: spoon, drops, half a tablet, inhaler. */
export const edgeCasePerson: Person = {
  id: 'edge',
  label: 'Edge cases',
  mark: 'b',
  medicines: [
    medicine('syrup', {
      name: names.syrup,
      form: 'liquid',
      color: 'pink',
      qty: 7.5,
      timing: { doses: ['sunrise', 'sunset'] },
      course: { amount: 5 },
      rules: ['shakeFirst'],
    }),
    medicine('drops', {
      name: names.drops,
      form: 'drops',
      color: 'blue',
      qty: 2,
      timing: { doses: ['sunrise', 'midday', 'sunset'] },
      course: { amount: 7 },
    }),
    medicine('half', {
      name: names.tablet,
      qty: 0.5,
      timing: { doses: ['night'] },
      course: { amount: 10 },
      rules: ['sleepiness'],
    }),
    medicine('inhaler', {
      name: names.inhaler,
      form: 'inhaler',
      color: 'orange',
      qty: 2,
      timing: { doses: ['sunrise', 'night'] },
      course: { ongoing: true },
    }),
  ],
};

export const every8Person: Person = {
  id: 'every8',
  label: 'Every 8 hours',
  mark: 'c',
  medicines: [
    medicine('every8', {
      name: names.medicine,
      color: 'yellow',
      score: true,
      timing: { mode: 'every', everyHours: 8, doses: ['sunrise', 'afternoon', 'night'] },
      course: { amount: 5 },
    }),
  ],
};

export const sampleMeta: ScheduleMeta = {
  preparedBy: copy.styleguide.printables.pharmacy,
  preparedOn: '2026-11-25',
};
