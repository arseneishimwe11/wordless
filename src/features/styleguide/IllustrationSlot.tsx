import { copy } from '@/copy/en';

import type { StyleWithVars } from './cssVars';
import styles from './IllustrationSlot.module.css';

interface IllustrationSlotProps {
  /** What the finished drawing shows (read by screen readers). */
  label: string;
  /** Size of the drawing in the design, in px. */
  width: number;
  height: number;
}

/**
 * Reserves the exact space of a design illustration that Phase 3 will draw, so
 * layout can be compared with the design before the drawings exist.
 */
export function IllustrationSlot({ label, width, height }: IllustrationSlotProps) {
  const style: StyleWithVars = {
    '--slot-width': `${String(width)}px`,
    '--slot-ratio': `${String(width)} / ${String(height)}`,
  };
  return (
    <span className={styles.slot} style={style} role="img" aria-label={label}>
      {width >= 96 && (
        <span className={styles.note} aria-hidden="true">
          {copy.styleguide.placeholder}
        </span>
      )}
    </span>
  );
}
