/**
 * The four household marks. Each person keeps their own: it prints on their sheet
 * and goes on their medicine bag, so sheets are told apart without reading a name.
 */
export const HOUSEHOLD_MARKS = ['a', 'b', 'c', 'd'] as const;

export type HouseholdMarkId = (typeof HOUSEHOLD_MARKS)[number];

/** The first mark nobody uses yet, or null when all four are taken. */
export function nextFreeMark(used: readonly HouseholdMarkId[]): HouseholdMarkId | null {
  return HOUSEHOLD_MARKS.find((mark) => !used.includes(mark)) ?? null;
}
