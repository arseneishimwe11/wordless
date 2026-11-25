import type { ReactNode } from 'react';

import { Glyph } from '@/graphics';
import { cx } from '@/lib/cx';

import { Animated } from '../Animated';
import choice from '../choice.module.css';
import { useOptionGroup } from '../OptionGroup';
import styles from './ToggleCard.module.css';

export interface ToggleCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Defaults to the surrounding OptionGroup's type. */
  type?: 'radio' | 'checkbox' | undefined;
  /** Defaults to the surrounding OptionGroup's name. */
  name?: string | undefined;
  value?: string | undefined;
  /**
   * `row`: drawing beside the label (Pill Builder form).
   * `stack`: a big card (rules): beside the label on phones, above it on desktop.
   * `option`: drawing, title and subtitle (print choices).
   */
  layout: 'row' | 'stack' | 'option';
  size?: 'phone' | 'desktop' | undefined;
  /** The drawing: a Glyph, PillUnit or Icon. Decorative: the title names the card. */
  media?: ReactNode;
  title: string;
  subtitle?: string | undefined;
  /** Rule cards land a stamp in the corner when chosen. */
  stamp?: boolean | undefined;
  /** The dashed "None of these" card. */
  dashed?: boolean | undefined;
  /** Which hand-drawn corner shape (the design rotates three). */
  shape?: 1 | 2 | 3 | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

/** A large choice card. Built on a radio or checkbox, so it works from the keyboard. */
export function ToggleCard({
  checked,
  onChange,
  type,
  name,
  value,
  layout,
  size = 'phone',
  media,
  title,
  subtitle,
  stamp = false,
  dashed = false,
  shape = 1,
  disabled = false,
  className,
}: ToggleCardProps) {
  const group = useOptionGroup();
  const inputType = type ?? group?.type ?? 'checkbox';
  return (
    <label className={cx(choice.option, styles.card, className)}>
      <input
        type={inputType}
        name={name ?? group?.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
        className={choice.input}
      />
      <span
        className={cx(
          styles.face,
          styles[layout],
          styles[size],
          styles[`shape${String(shape)}`],
          dashed && styles.dashed,
        )}
      >
        {media && (
          <span className={styles.media} aria-hidden="true">
            {media}
          </span>
        )}
        {subtitle ? (
          <span className={styles.text}>
            <span className={styles.title}>{title}</span>
            <span className={styles.subtitle}>{subtitle}</span>
          </span>
        ) : (
          <span className={styles.title}>{title}</span>
        )}
        {stamp && checked && (
          <span className={styles.stamp} aria-hidden="true">
            <Animated effect="stamp">
              <Glyph name="course-done" size={size === 'desktop' ? 36 : 34} />
            </Animated>
          </span>
        )}
      </span>
    </label>
  );
}
