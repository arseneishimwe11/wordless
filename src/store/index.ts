import { useStore } from 'zustand';

import { createDraftStore, type DraftState } from './draft';
import { createHouseholdStore, type HouseholdState } from './household';
import { createPrefsStore, type PrefsState } from './prefs';
import { idbStore } from './storage';

export { createDraftStore, emptyDraft, type DraftState, type DraftStore } from './draft';
export {
  createHouseholdStore,
  emptyHousehold,
  type HouseholdState,
  type HouseholdStore,
} from './household';
export { corruptKey, load, save, type LoadError, type LoadResult } from './persist';
export { createPrefsStore, defaultPrefs, type PrefsState, type PrefsStore } from './prefs';
export {
  KEYS,
  migrate,
  PRINT_OUTPUTS,
  STORAGE_VERSION,
  type Draft,
  type Migration,
  type Prefs,
  type PrintOutput,
} from './schema';
export { idbStore, memoryStore, type KeyValueStore } from './storage';

/** The app's stores, on the device's IndexedDB. Call `load()` on each once at startup. */
const storage = idbStore();
export const householdStore = createHouseholdStore(storage);
export const draftStore = createDraftStore(storage);
export const prefsStore = createPrefsStore(storage);

export const useHousehold = <T>(select: (state: HouseholdState) => T): T =>
  useStore(householdStore, select);

export const useDraft = <T>(select: (state: DraftState) => T): T => useStore(draftStore, select);

export const usePrefs = <T>(select: (state: PrefsState) => T): T => useStore(prefsStore, select);

let loading: Promise<void> | null = null;

/**
 * Reads the stores from the device, once. Every route loader awaits it, so screens
 * never render (or save) before the saved data is in.
 */
export function loadStores(): Promise<void> {
  loading ??= Promise.all([
    householdStore.getState().load(),
    draftStore.getState().load(),
    prefsStore.getState().load(),
  ]).then(() => undefined);
  return loading;
}
