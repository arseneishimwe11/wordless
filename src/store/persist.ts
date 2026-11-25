/**
 * Loading and saving, safely. Saved data is never thrown away: anything that can't
 * be read is copied aside under a "corrupt" key before the app starts empty, so it
 * can still be recovered by hand.
 */
import type { z } from 'zod';

import { envelopeSchema, migrate, MIGRATIONS, STORAGE_VERSION, type Migration } from './schema';
import type { KeyValueStore } from './storage';

export type LoadError =
  /** The saved data couldn't be read; it was kept aside and the app started empty. */
  | 'corrupt'
  /** Saved by a newer version of the app; kept aside, and this version started empty. */
  | 'newer-version'
  /** The device's storage can't be used (a private window, or storage is full or blocked). */
  | 'unavailable';

export interface LoadResult<T> {
  data: T | null;
  error: LoadError | null;
}

/** Where unreadable data is kept: "wordless:household:corrupt:1764072000000". */
export const corruptKey = (key: string, now: number): string => `${key}:corrupt:${String(now)}`;

export interface LoadOptions {
  migrations?: Readonly<Record<number, Migration>> | undefined;
  version?: number | undefined;
  now?: (() => number) | undefined;
}

export async function load<T>(
  storage: KeyValueStore,
  key: string,
  schema: z.ZodType<T>,
  { migrations = MIGRATIONS, version = STORAGE_VERSION, now = Date.now }: LoadOptions = {},
): Promise<LoadResult<T>> {
  let raw: unknown;
  try {
    raw = await storage.get(key);
  } catch {
    return { data: null, error: 'unavailable' };
  }
  if (raw === undefined) return { data: null, error: null };

  const envelope = envelopeSchema.safeParse(raw);
  const migrated = envelope.success ? migrate(envelope.data, migrations, version) : null;
  const parsed = migrated?.ok ? schema.safeParse(migrated.data) : null;
  if (parsed?.success) return { data: parsed.data, error: null };

  try {
    await storage.set(corruptKey(key, now()), raw);
    await storage.del(key);
  } catch {
    return { data: null, error: 'unavailable' };
  }
  return {
    data: null,
    error: migrated?.ok === false && migrated.reason === 'newer' ? 'newer-version' : 'corrupt',
  };
}

export async function save(storage: KeyValueStore, key: string, data: unknown): Promise<void> {
  await storage.set(key, { version: STORAGE_VERSION, data });
}

/**
 * Saves one after another, so a slow write can never land after a newer one.
 * `flush()` resolves once everything queued so far is written.
 */
export function writeQueue(storage: KeyValueStore, key: string, onError: () => void) {
  let tail: Promise<void> = Promise.resolve();
  return {
    push(data: unknown) {
      tail = tail.then(() => save(storage, key, data)).catch(onError);
    },
    flush: () => tail,
  };
}
