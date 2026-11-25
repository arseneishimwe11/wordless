import { cx } from '@/lib/cx';

import styles from './StepProgress.module.css';

export interface StepProgressProps {
  /** The current step, from 1. */
  current: number;
  total: number;
  /** The words under the segments ("When · step 2 of 4"); they carry the meaning. */
  label: string;
  className?: string | undefined;
}

/** The phone flow's progress: done steps in ink, the current one wider, in saffron. */
export function StepProgress({ current, total, label, className }: StepProgressProps) {
  return (
    <div className={cx(styles.progress, className)}>
      <div className={styles.segments} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              styles.segment,
              i + 1 < current && styles.done,
              i + 1 === current && styles.current,
            )}
          />
        ))}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
