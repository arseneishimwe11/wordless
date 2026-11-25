import { createStore } from 'zustand/vanilla';

import {
  newId,
  nextFreeMark,
  type Household,
  type HouseholdMarkId,
  type Medicine,
  type Person,
} from '@/domain';

import { load, writeQueue, type LoadError } from './persist';
import { KEYS, savedHouseholdSchema } from './schema';
import type { KeyValueStore } from './storage';

export interface HouseholdState extends Household {
  /** "loading" until the saved household has been read; nothing is saved before that. */
  status: 'loading' | 'ready';
  loadError: LoadError | null;
  /** The last save failed (storage full or blocked); the data is still in memory. */
  saveFailed: boolean;
  load: () => Promise<void>;
  /**
   * Adds someone with the next free mark; null when all four marks are taken. The label
   * can depend on the mark ("Person B").
   */
  addPerson: (label: string | ((mark: HouseholdMarkId) => string)) => Person | null;
  renamePerson: (personId: string, label: string) => void;
  removePerson: (personId: string) => void;
  /** Adds the medicine, or replaces the one with the same id. */
  saveMedicine: (personId: string, medicine: Medicine) => void;
  removeMedicine: (personId: string, medicineId: string) => void;
  setPreparedBy: (preparedBy: string) => void;
  /** Resolves once every change so far is saved. */
  flush: () => Promise<void>;
}

export const emptyHousehold = (): Household => ({ people: [], preparedBy: '' });

export function createHouseholdStore(storage: KeyValueStore) {
  return createStore<HouseholdState>()((setState, getState) => {
    const queue = writeQueue(storage, KEYS.household, () => {
      setState({ saveFailed: true });
    });

    /** Applies a change and saves the result. */
    const change = (next: (state: Household) => Partial<Household>) => {
      setState((state) => next(state));
      const { status, people, preparedBy } = getState();
      if (status === 'ready') queue.push({ people, preparedBy });
    };

    const mapPerson = (personId: string, fn: (person: Person) => Person) => {
      change((s) => ({ people: s.people.map((p) => (p.id === personId ? fn(p) : p)) }));
    };

    return {
      ...emptyHousehold(),
      status: 'loading',
      loadError: null,
      saveFailed: false,

      load: async () => {
        const { data, error } = await load(storage, KEYS.household, savedHouseholdSchema);
        setState({ ...(data ?? emptyHousehold()), status: 'ready', loadError: error });
      },

      addPerson: (label) => {
        const mark = nextFreeMark(getState().people.map((p) => p.mark));
        if (!mark) return null;
        const person: Person = {
          id: newId(),
          label: typeof label === 'function' ? label(mark) : label,
          mark,
          medicines: [],
        };
        change((s) => ({ people: [...s.people, person] }));
        return person;
      },

      renamePerson: (personId, label) => {
        mapPerson(personId, (p) => ({ ...p, label }));
      },

      removePerson: (personId) => {
        change((s) => ({ people: s.people.filter((p) => p.id !== personId) }));
      },

      saveMedicine: (personId, medicine) => {
        mapPerson(personId, (p) => ({
          ...p,
          medicines: p.medicines.some((m) => m.id === medicine.id)
            ? p.medicines.map((m) => (m.id === medicine.id ? medicine : m))
            : [...p.medicines, medicine],
        }));
      },

      removeMedicine: (personId, medicineId) => {
        mapPerson(personId, (p) => ({
          ...p,
          medicines: p.medicines.filter((m) => m.id !== medicineId),
        }));
      },

      setPreparedBy: (preparedBy) => {
        change(() => ({ preparedBy }));
      },

      flush: () => queue.flush(),
    };
  });
}

export type HouseholdStore = ReturnType<typeof createHouseholdStore>;
