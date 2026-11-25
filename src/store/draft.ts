import { createStore } from 'zustand/vanilla';

import {
  addDose,
  changeForm,
  clearDoses,
  clearRules,
  newMedicine,
  pickUsualLength,
  placeTimesADay,
  setAmount,
  setColor,
  setEvery,
  setMode,
  setOngoing,
  setScore,
  setUnit,
  stepAmount,
  stepMaxPerDay,
  stepQty,
  toggleDose,
  toggleRule,
  type ColorPart,
  type CourseUnit,
  type EntryStep,
  type EveryHours,
  type Medicine,
  type PillColor,
  type PillForm,
  type TimeOfDay,
  type TimesADay,
  type TimingMode,
  type Rule,
} from '@/domain';

import { load, writeQueue, type LoadError } from './persist';
import { draftSchema, KEYS, type Draft } from './schema';
import type { KeyValueStore } from './storage';

export interface DraftState extends Draft {
  status: 'loading' | 'ready';
  loadError: LoadError | null;
  saveFailed: boolean;
  load: () => Promise<void>;
  /** Starts entering a medicine for someone: a new one, or a copy of a saved one to change. */
  start: (personId: string, existing?: Medicine) => void;
  setStep: (step: EntryStep) => void;
  setName: (name: string) => void;
  setForm: (form: PillForm) => void;
  setColor: (color: PillColor, part?: ColorPart) => void;
  setScore: (score: boolean) => void;
  stepQty: (direction: 1 | -1) => void;
  toggleDose: (time: TimeOfDay) => void;
  addDose: (time: TimeOfDay) => void;
  placeTimesADay: (count: TimesADay) => void;
  setEvery: (hours: EveryHours) => void;
  setMode: (mode: TimingMode) => void;
  stepMaxPerDay: (direction: 1 | -1) => void;
  clearDoses: () => void;
  setAmount: (amount: number | null) => void;
  stepAmount: (direction: 1 | -1) => void;
  setUnit: (unit: CourseUnit) => void;
  pickUsualLength: (days: number) => void;
  setOngoing: (ongoing: boolean) => void;
  toggleRule: (rule: Rule) => void;
  clearRules: () => void;
  /** Done or cancelled: back to a blank medicine. */
  reset: () => void;
  flush: () => Promise<void>;
}

export const emptyDraft = (): Draft => ({
  personId: null,
  editingId: null,
  step: 'medicine',
  medicine: newMedicine(),
});

export function createDraftStore(storage: KeyValueStore) {
  return createStore<DraftState>()((setState, getState) => {
    const queue = writeQueue(storage, KEYS.draft, () => {
      setState({ saveFailed: true });
    });

    const change = (next: Partial<Draft>) => {
      setState(next);
      const { status, personId, editingId, step, medicine } = getState();
      if (status === 'ready') queue.push({ personId, editingId, step, medicine });
    };

    const edit = (fn: (m: Medicine) => Medicine) => {
      change({ medicine: fn(getState().medicine) });
    };
    const timing = (fn: (t: Medicine['timing']) => Medicine['timing']) => {
      edit((m) => ({ ...m, timing: fn(m.timing) }));
    };
    const course = (fn: (c: Medicine['course']) => Medicine['course']) => {
      edit((m) => ({ ...m, course: fn(m.course) }));
    };

    return {
      ...emptyDraft(),
      status: 'loading',
      loadError: null,
      saveFailed: false,

      load: async () => {
        const { data, error } = await load(storage, KEYS.draft, draftSchema);
        setState({ ...(data ?? emptyDraft()), status: 'ready', loadError: error });
      },

      start: (personId, existing) => {
        change({
          personId,
          editingId: existing?.id ?? null,
          step: 'medicine',
          medicine: existing ? structuredClone(existing) : newMedicine(),
        });
      },
      setStep: (step) => {
        change({ step });
      },
      setName: (name) => {
        edit((m) => ({ ...m, name }));
      },
      setForm: (form) => {
        edit((m) => changeForm(m, form));
      },
      setColor: (color, part) => {
        edit((m) => setColor(m, color, part));
      },
      setScore: (score) => {
        edit((m) => setScore(m, score));
      },
      stepQty: (direction) => {
        edit((m) => stepQty(m, direction));
      },
      toggleDose: (time) => {
        timing((t) => toggleDose(t, time));
      },
      addDose: (time) => {
        timing((t) => addDose(t, time));
      },
      placeTimesADay: (count) => {
        timing((t) => placeTimesADay(t, count));
      },
      setEvery: (hours) => {
        timing((t) => setEvery(t, hours));
      },
      setMode: (mode) => {
        timing((t) => setMode(t, mode));
      },
      stepMaxPerDay: (direction) => {
        timing((t) => stepMaxPerDay(t, direction));
      },
      clearDoses: () => {
        timing(clearDoses);
      },
      setAmount: (amount) => {
        course((c) => setAmount(c, amount));
      },
      stepAmount: (direction) => {
        course((c) => stepAmount(c, direction));
      },
      setUnit: (unit) => {
        course((c) => setUnit(c, unit));
      },
      pickUsualLength: (days) => {
        course((c) => pickUsualLength(c, days));
      },
      setOngoing: (ongoing) => {
        course((c) => setOngoing(c, ongoing));
      },
      toggleRule: (rule) => {
        edit((m) => ({ ...m, rules: toggleRule(m.rules, rule) }));
      },
      clearRules: () => {
        edit((m) => ({ ...m, rules: clearRules() }));
      },
      reset: () => {
        change(emptyDraft());
      },
      flush: () => queue.flush(),
    };
  });
}

export type DraftStore = ReturnType<typeof createDraftStore>;
