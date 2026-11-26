import { useId } from 'react';

import { cx } from '@/lib/cx';

import choice from '../choice.module.css';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Names the group for screen readers ("How the prescription gives the time"). */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** Height in px: 44, 48 (phone), 52 (desktop). */
  size?: 44 | 48 | 52 | undefined;
  /** Corner shape: `control` everywhere, `segment` for the Sun Arc's mode picker. */
  shape?: 'control' | 'segment' | undefined;
  /** Each segment as wide as its words, as the live sheet's Colour / Black & white is. */
  fit?: boolean | undefined;
  className?: string | undefined;
}

/** One choice from a few, on an ink track: "Times a day · Every … h · When needed". */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  orientation = 'horizontal',
  size = 48,
  shape = 'control',
  fit = false,
  className,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        styles.track,
        orientation === 'vertical' && styles.vertical,
        shape === 'segment' && styles.segmentShape,
        styles[`size${String(size)}`],
        fit && styles.fit,
        className,
      )}
    >
      {options.map((option) => (
        <label key={option.value} className={cx(choice.option, styles.item)}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => {
              onChange(option.value);
            }}
            className={choice.input}
          />
          <span className={styles.face}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
