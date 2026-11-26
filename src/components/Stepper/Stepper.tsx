import type { ButtonHTMLAttributes } from 'react';

import { Icon } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './Stepper.module.css';

export interface StepperValue {
  value: string;
  unit?: string | undefined;
}

export interface StepperProps {
  /** Names the control ("Each time"). */
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** The allowed values, in order (a pill's quantity steps). Or use min, max and step. */
  steps?: readonly number[] | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  /** How the value is shown ("1½" "tablets"). Defaults to the number. */
  format?: ((value: number) => StepperValue) | undefined;
  decreaseLabel: string;
  increaseLabel: string;
  /** Button size in px: 48 (phone), 52 (desktop copies), 56 (desktop). */
  size?: 48 | 52 | 56 | undefined;
  /** Width of the value in px (the design uses 84, 40, 96, 44). */
  valueWidth?: number | undefined;
  /** Display size of the number, by its authored size. */
  valueSize?: 30 | 32 | 36 | undefined;
  className?: string | undefined;
}

interface StepperButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  direction: 'decrease' | 'increase';
  label: string;
  /** 48, 52 (How long on phones), 56, 64 (How long on desktop). */
  size?: 48 | 52 | 56 | 64 | undefined;
}

/** A − or + button on its own, for steppers around a typed number (How long). */
export function StepperButton({
  direction,
  label,
  size = 48,
  className,
  ...rest
}: StepperButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        styles.button,
        styles[`size${String(size)}`],
        direction === 'decrease' ? styles.decrease : styles.increase,
        className,
      )}
      {...rest}
    >
      <Icon name={direction === 'decrease' ? 'minus' : 'plus'} />
    </button>
  );
}

function neighbours(value: number, props: StepperProps): [number | null, number | null] {
  if (props.steps) {
    const i = props.steps.indexOf(value);
    const at = i < 0 ? 0 : i;
    return [props.steps[at - 1] ?? null, props.steps[at + 1] ?? null];
  }
  const step = props.step ?? 1;
  const down = value - step;
  const up = value + step;
  return [
    props.min === undefined || down >= props.min ? down : null,
    props.max === undefined || up <= props.max ? up : null,
  ];
}

/** − value +. Counts through the allowed values; each end is disabled. */
export function Stepper(props: StepperProps) {
  const {
    label,
    value,
    onChange,
    format = (v: number): StepperValue => ({ value: String(v) }),
    decreaseLabel,
    increaseLabel,
    size = 48,
    valueWidth = 84,
    valueSize = 30,
    className,
  } = props;
  const [previous, next] = neighbours(value, props);
  const shown = format(value);

  return (
    <div role="group" aria-label={label} className={cx(styles.stepper, className)}>
      <StepperButton
        direction="decrease"
        label={decreaseLabel}
        size={size}
        disabled={previous === null}
        onClick={() => {
          if (previous !== null) onChange(previous);
        }}
      />
      <output
        aria-live="polite"
        className={styles.value}
        style={{ width: valueWidth, fontSize: `var(--display-${String(valueSize)})` }}
      >
        <span className={styles.number}>{shown.value}</span>
        {shown.unit && <span className={styles.unit}>{shown.unit}</span>}
      </output>
      <StepperButton
        direction="increase"
        label={increaseLabel}
        size={size}
        disabled={next === null}
        onClick={() => {
          if (next !== null) onChange(next);
        }}
      />
    </div>
  );
}
