import type { HouseholdMarkId } from '@/domain/household';

import { Glyph } from '../Glyph';

export { HOUSEHOLD_MARKS, type HouseholdMarkId } from '@/domain/household';

export interface HouseholdMarkProps {
  mark: HouseholdMarkId;
  size?: number | undefined;
  label?: string | undefined;
  className?: string | undefined;
}

/** A person's mark: one colour and one pattern, on their sheet and their medicine bags. */
export function HouseholdMark({ mark, size = 48, label, className }: HouseholdMarkProps) {
  return <Glyph name={`household-${mark}`} size={size} label={label} className={className} />;
}
