import { del, get, set } from 'idb-keyval';

/** Where the stores keep their data. Values are structured-cloneable objects. */
export interface KeyValueStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
}

/** The device's IndexedDB (the default idb-keyval database). */
export const idbStore = (): KeyValueStore => ({
  get: (key) => get(key),
  set: (key, value) => set(key, value),
  del: (key) => del(key),
});

/** An in-memory store for tests, or for when IndexedDB isn't available. */
export function memoryStore(initial: Record<string, unknown> = {}): KeyValueStore & {
  entries: Map<string, unknown>;
} {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    get: (key) => Promise.resolve(structuredClone(entries.get(key))),
    set: (key, value) => {
      entries.set(key, structuredClone(value));
      return Promise.resolve();
    },
    del: (key) => {
      entries.delete(key);
      return Promise.resolve();
    },
  };
}
