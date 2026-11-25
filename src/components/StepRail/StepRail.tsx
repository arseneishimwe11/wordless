import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './StepRail.module.css';

export interface StepRailProps {
  /** Names the navigation ("Steps"). */
  label: string;
  children: ReactNode;
  className?: string | undefined;
}

/** The desktop entry's step bar: one button per step, the current one raised. */
export function StepRail({ label, children, className }: StepRailProps) {
  return (
    <nav aria-label={label} className={cx(styles.rail, className)}>
      {children}
    </nav>
  );
}

export interface StepRailItemProps {
  /** The step number (shown until the step is done). */
  number: number;
  title: string;
  /** What was entered, or "—" ("Amoxicillin 500 mg · 1 capsule"). */
  summary: string;
  current?: boolean | undefined;
  done?: boolean | undefined;
  /** How "done" is said to screen readers, next to the tick ("done"). */
  doneLabel: string;
  onSelect: () => void;
}

/** One step in the rail. The done mark is a tick in an ink circle. */
export function StepRailItem({
  number,
  title,
  summary,
  current = false,
  done = false,
  doneLabel,
  onSelect,
}: StepRailItemProps) {
  const showTick = done && !current;
  return (
    <button
      type="button"
      aria-current={current ? 'step' : undefined}
      onClick={onSelect}
      className={cx(styles.item, current && styles.current)}
    >
      <span className={cx(styles.marker, showTick && styles.markerDone)} aria-hidden="true">
        {showTick ? '✓' : number}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>
          {title}
          {showTick && <span className="visuallyHidden">, {doneLabel}</span>}
        </span>
        <span className={styles.summary}>{summary}</span>
      </span>
    </button>
  );
}
