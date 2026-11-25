import { createStore } from 'zustand/vanilla';

import { load, writeQueue, type LoadError } from './persist';
import { KEYS, prefsSchema, type Prefs, type PrintOutput } from './schema';
import type { KeyValueStore } from './storage';

export interface PrefsState extends Prefs {
  status: 'loading' | 'ready';
  loadError: LoadError | null;
  load: () => Promise<void>;
  setMono: (mono: boolean) => void;
  setOutput: (output: PrintOutput) => void;
  flush: () => Promise<void>;
}

/** Colour, and the fridge sheet, until someone chooses otherwise. */
export const defaultPrefs = (): Prefs => ({ mono: false, output: 'sheet' });

export function createPrefsStore(storage: KeyValueStore) {
  return createStore<PrefsState>()((setState, getState) => {
    // A preference that can't be saved is no loss: the default comes back next time.
    const queue = writeQueue(storage, KEYS.prefs, () => undefined);

    const change = (next: Partial<Prefs>) => {
      setState(next);
      const { status, mono, output } = getState();
      if (status === 'ready') queue.push({ mono, output });
    };

    return {
      ...defaultPrefs(),
      status: 'loading',
      loadError: null,
      load: async () => {
        const { data, error } = await load(storage, KEYS.prefs, prefsSchema);
        setState({ ...(data ?? defaultPrefs()), status: 'ready', loadError: error });
      },
      setMono: (mono) => {
        change({ mono });
      },
      setOutput: (output) => {
        change({ output });
      },
      flush: () => queue.flush(),
    };
  });
}

export type PrefsStore = ReturnType<typeof createPrefsStore>;
