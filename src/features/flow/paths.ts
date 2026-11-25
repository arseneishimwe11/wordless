import type { EntryStep } from '@/domain';

/** Each entry step has its own address, so the back button and a reload both work. */
export const STEP_PATHS: Record<EntryStep, string> = {
  medicine: '/entry/medicine',
  when: '/entry/when',
  howLong: '/entry/how-long',
  rules: '/entry/rules',
};

export const START_PATH = '/';
export const PRINT_PATH = '/print';
export const SCAN_PATH = '/scan';

export const householdPath = (personId?: string | null): string =>
  personId ? `/household?person=${encodeURIComponent(personId)}` : '/household';
