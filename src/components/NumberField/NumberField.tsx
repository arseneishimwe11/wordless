import type { InputHTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

import styles from './NumberField.module.css';

export interface NumberFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'min' | 'max' | 'size' | 'aria-invalid'
> {
  /** Names the field for screen readers ("How long, as a number"). */
  label: string;
  value: number | null;
  /** Called with a whole number between min and max, or null when the field is empty. */
  onChange: (value: number | null) => void;
  min?: number | undefined;
  max?: number | undefined;
  /** 90×60 on phones, 150×100 on desktop. */
  size?: 'phone' | 'desktop' | undefined;
  /** Marks the field as needing an answer (error border and wash). */
  invalid?: boolean | undefined;
}

/** Turns typed text into a whole number in range, or null when there is nothing usable. */
export function parseWholeNumber(text: string, min: number, max: number): number | null {
  const n = Number.parseInt(text, 10);
  if (Number.isNaN(n) || n < min) return null;
  return Math.min(n, max);
}

/** A big number typed in the display font, with "?" while empty. */
export function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max = 90,
  size = 'phone',
  invalid = false,
  placeholder = '?',
  className,
  ...rest
}: NumberFieldProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      aria-invalid={invalid || undefined}
      min={min}
      max={max}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(event) => {
        onChange(parseWholeNumber(event.currentTarget.value, min, max));
      }}
      className={cx(styles.field, styles[size], invalid && styles.invalid, className)}
      {...rest}
    />
  );
}
