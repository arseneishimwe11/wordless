import { redirect } from 'react-router';

import { draftStore, householdStore, loadStores } from '@/store';

import { START_PATH } from './paths';

/**
 * For the entry steps: the stores must be loaded and a medicine being entered for
 * someone who exists. A direct visit with nothing in progress goes to the start.
 */
export async function requireDraft(): Promise<Response | null> {
  await loadStores();
  const { personId } = draftStore.getState();
  if (!personId || !householdStore.getState().people.some((p) => p.id === personId)) {
    return redirect(START_PATH);
  }
  return null;
}

/** For the household screen: someone must be in it. */
export async function requireHousehold(): Promise<Response | null> {
  await loadStores();
  if (householdStore.getState().people.length === 0) return redirect(START_PATH);
  return null;
}
