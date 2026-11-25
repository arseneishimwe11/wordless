/**
 * What the app keeps on the device, and how older saved data is brought up to date.
 * Everything is saved in an envelope, { version, data }, so a future version can
 * tell what it is reading and migrate it.
 */
import { z } from 'zod';

import { ENTRY_STEPS, householdSchema, medicineSchema } from '@/domain';

export const STORAGE_VERSION = 1;

export const KEYS = {
  household: 'wordless:household',
  draft: 'wordless:draft',
  prefs: 'wordless:prefs',
} as const;

export const envelopeSchema = z.object({
  version: z.int().min(0),
  data: z.unknown(),
});

export type Envelope = z.infer<typeof envelopeSchema>;

export const savedHouseholdSchema = householdSchema;

/** The medicine being entered, kept so a reload (or a dead battery) doesn't lose it. */
export const draftSchema = z.object({
  personId: z.string().nullable(),
  /** The saved medicine being changed, or null for a new one. */
  editingId: z.string().nullable(),
  step: z.enum(ENTRY_STEPS),
  medicine: medicineSchema,
});

export type Draft = z.infer<typeof draftSchema>;

export const PRINT_OUTPUTS = ['sheet', 'strips'] as const;

export type PrintOutput = (typeof PRINT_OUTPUTS)[number];

/** How the last sheet was printed, to offer the same next time. */
export const prefsSchema = z.object({
  /** For a black and white printer. */
  mono: z.boolean(),
  output: z.enum(PRINT_OUTPUTS),
});

export type Prefs = z.infer<typeof prefsSchema>;

/** Turns data saved by version N into version N + 1. */
export type Migration = (data: unknown) => unknown;

/**
 * The upgrades, keyed by the version they upgrade from. Version 1 is the first
 * saved format, so there are none yet; the next format change adds `1: (data) => …`.
 */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {};

export type MigrateResult = { ok: true; data: unknown } | { ok: false; reason: 'newer' | 'gap' };

/** Runs each upgrade in turn, from the saved version to the current one. */
export function migrate(
  envelope: Envelope,
  migrations: Readonly<Record<number, Migration>> = MIGRATIONS,
  target: number = STORAGE_VERSION,
): MigrateResult {
  if (envelope.version > target) return { ok: false, reason: 'newer' };
  let data = envelope.data;
  for (let version = envelope.version; version < target; version += 1) {
    const step = migrations[version];
    if (!step) return { ok: false, reason: 'gap' };
    data = step(data);
  }
  return { ok: true, data };
}
