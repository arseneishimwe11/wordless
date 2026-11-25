import type { Medicine, PillUnitKind } from '@/domain';
import { PillUnit } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './DashedDose.module.css';

export interface DashedDoseProps {
  medicine: Pick<Medicine, 'color' | 'color2' | 'score'>;
  unit: PillUnitKind;
  /** 34 in the Household grid, 42 on the Sun Arc, 48 on the printed sheet. */
  size?: 34 | 42 | 48 | undefined;
  className?: string | undefined;
}

/** A dose that is only taken if needed: the pill inside a dashed circle. Decorative. */
export function DashedDose({ medicine, unit, size = 34, className }: DashedDoseProps) {
  const pill = (
    <PillUnit
      kind={unit}
      color={medicine.color}
      color2={medicine.color2}
      score={medicine.score}
      size={{ 34: 24, 42: 30, 48: 20 }[size]}
    />
  );
  // On the printed sheet the circle is smaller than its 48px slot, as in the design's drawing.
  if (size === 48) {
    return (
      <span className={cx(styles.slot, className)} aria-hidden="true">
        <span className={cx(styles.dose, styles.print)}>{pill}</span>
      </span>
    );
  }
  return (
    <span className={cx(styles.dose, size === 42 && styles.large, className)} aria-hidden="true">
      {pill}
    </span>
  );
}
