import { useId, type InputHTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'id' | 'aria-invalid'
> {
  label: string;
  /** Quieter words after the label ("— for you, not the patient"). */
  hint?: string | undefined;
  /** An error message under the field; also marks the field invalid. */
  error?: string | undefined;
  size?: 'phone' | 'desktop' | undefined;
  className?: string | undefined;
}

/** A labelled text input, 48px on phones and 58px on desktop. */
export function TextField({
  label,
  hint,
  error,
  size = 'phone',
  className,
  ...input
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cx(styles.field, styles[size], className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint && ' '}
        {hint && <span className={styles.hint}>{hint}</span>}
      </label>
      <input
        id={id}
        type="text"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(styles.input, error && styles.invalid)}
        {...input}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
