import type { InputHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  /** `inline`: a checklist line. `pill`: a bordered chip ("Score line"). */
  variant?: 'inline' | 'pill' | undefined;
  /** A small drawing before the label (decorative). */
  media?: ReactNode;
  className?: string | undefined;
}

/** A native checkbox in ink, with its label. */
export function Checkbox({ label, variant = 'inline', media, className, ...input }: CheckboxProps) {
  return (
    <label className={cx(styles.checkbox, styles[variant], className)}>
      <input type="checkbox" className={styles.box} {...input} />
      <span className={styles.label}>
        {media && (
          <span className={styles.media} aria-hidden="true">
            {media}
          </span>
        )}
        {label}
      </span>
    </label>
  );
}
