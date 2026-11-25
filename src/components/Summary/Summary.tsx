import { cx } from '@/lib/cx';

import styles from './Summary.module.css';

export interface SummaryProps {
  /** The bold line ("Sunrise, midday and sunset"). */
  title: string;
  /** The quieter line under it ("1 capsule each time · about 6 am · 12 noon · 6 pm"). */
  detail?: string | undefined;
  /** `error` when the summary says what is missing ("Add at least one time first"). */
  tone?: 'default' | 'error' | undefined;
  /** Size of the bold line: 17 on phones, 19 or 20 on desktop. */
  size?: 17 | 19 | 20 | undefined;
  id?: string | undefined;
  className?: string | undefined;
}

/** What has been entered, in words. Changes are announced politely to screen readers. */
export function Summary({
  title,
  detail,
  tone = 'default',
  size = 17,
  id,
  className,
}: SummaryProps) {
  return (
    <div
      id={id}
      aria-live="polite"
      className={cx(styles.summary, styles[`size${String(size)}`], className)}
    >
      <span className={cx(styles.title, tone === 'error' && styles.error)}>{title}</span>
      {detail && <span className={styles.detail}>{detail}</span>}
    </div>
  );
}
