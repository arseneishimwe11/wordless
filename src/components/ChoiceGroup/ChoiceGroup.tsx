import { useId, type CSSProperties } from 'react';

import { cx } from '@/lib/cx';

import choice from '../choice.module.css';
import styles from './ChoiceGroup.module.css';

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  /** Fill the remaining row width ("No end date"). */
  wide?: boolean | undefined;
  /** This chip's width in px, where the design gives one (the Sun Arc's "12 h" is wider). */
  width?: number | undefined;
  /**
   * Draw this one chip differently from the group: `label` is a quieter 16px word
   * ("No end date" among number chips).
   */
  chip?: 'number' | 'text' | 'label' | undefined;
}

export interface ChoiceGroupProps<T extends string | number> {
  /** Names the group for screen readers ("Usual lengths"). */
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `number`: the display font (1–4, 5/7/10/14). `text`: bold body text (4 h, No end date). */
  chip: 'number' | 'text';
  size?: 'phone' | 'desktop' | undefined;
  /** Default chip width in px, or `fill` to stretch into a grid cell (desktop). */
  chipWidth?: number | 'fill' | undefined;
  /** Display size of number chips, by the design's authored size. */
  numberSize?: 22 | 24 | 26 | undefined;
  /** Space between chips in px: 10 (the Sun Arc) or 6 (How long's usual lengths). */
  gap?: 6 | 10 | undefined;
  /** On a narrow screen, narrow the chips (never below 44px) instead of wrapping the row. */
  shrink?: boolean | undefined;
  className?: string | undefined;
}

const SHAPES = ['chip-1', 'chip-2', 'chip-3'] as const;

/**
 * A row of chips, one of which is chosen (saffron). Built on radio buttons, so arrow
 * keys move the choice and the group is a single tab stop.
 */
export function ChoiceGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  chip,
  size = 'phone',
  chipWidth = size === 'desktop' ? 'fill' : chip === 'number' ? 56 : 74,
  numberSize = size === 'desktop' ? 26 : 24,
  gap = 10,
  shrink = false,
  className,
}: ChoiceGroupProps<T>) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(styles.group, shrink && styles.shrink, className)}
      style={{ '--group-gap': `var(--space-${String(gap)})` } as CSSProperties}
    >
      {options.map((option, i) => {
        const width = option.width ?? chipWidth;
        const kind = option.chip ?? chip;
        const style = {
          '--chip-shape': `var(--radius-${SHAPES[i % SHAPES.length] ?? 'chip-1'})`,
          ...(width !== 'fill' && !option.wide && { '--chip-width': `${String(width)}px` }),
          ...(kind === 'number' && { '--chip-font': `var(--display-${String(numberSize)})` }),
        } as CSSProperties;
        return (
          <label
            key={String(option.value)}
            className={cx(
              choice.option,
              styles.chip,
              (width === 'fill' || option.wide) && styles.fill,
            )}
            style={style}
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
              }}
              className={choice.input}
            />
            <span className={cx(styles.face, styles[kind], styles[size])}>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
