import type { Medicine, PillUnitKind } from '@/domain';
import { PillUnit } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './DashedDose.module.css';

export interface DashedDoseProps {
  medicine: Pick<Medicine, 'color' | 'color2' | 'score'>;
  unit: PillUnitKind;
  /** 34 in the Household grid, 42 on the Sun Arc. */
  size?: 34 | 42 | undefined;
  className?: string | undefined;
}

/** A dose that is only taken if needed: the pill inside a dashed circle. Decorative. */
export function DashedDose({ medicine, unit, size = 34, className }: DashedDoseProps) {
  return (
    <span className={cx(styles.dose, size === 42 && styles.large, className)} aria-hidden="true">
      <PillUnit
        kind={unit}
        color={medicine.color}
        color2={medicine.color2}
        score={medicine.score}
        size={size === 42 ? 30 : 24}
      />
    </span>
  );
}
