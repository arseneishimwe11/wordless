import { useStore } from 'zustand';

import { createDraftStore, type DraftState } from './draft';
import { createHouseholdStore, type HouseholdState } from './household';
import { idbStore } from './storage';

export { createDraftStore, emptyDraft, type DraftState, type DraftStore } from './draft';
export {
  createHouseholdStore,
  emptyHousehold,
  type HouseholdState,
  type HouseholdStore,
} from './household';
export { corruptKey, load, save, type LoadError, type LoadResult } from './persist';
export { KEYS, migrate, STORAGE_VERSION, type Draft, type Migration } from './schema';
export { idbStore, memoryStore, type KeyValueStore } from './storage';

/** The app's stores, on the device's IndexedDB. Call `load()` on each once at startup. */
const storage = idbStore();
export const householdStore = createHouseholdStore(storage);
export const draftStore = createDraftStore(storage);

export const useHousehold = <T>(select: (state: HouseholdState) => T): T =>
  useStore(householdStore, select);

export const useDraft = <T>(select: (state: DraftState) => T): T => useStore(draftStore, select);
