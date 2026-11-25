import type { ReactNode } from 'react';

import { IconButton, StepProgress } from '@/components';

import styles from './StepHeader.module.css';

export interface StepHeaderProps {
  /** The current step, from 1. */
  step: number;
  total: number;
  /** "When · step 2 of 4". */
  label: string;
  backLabel: string;
  onBack: () => void;
  /** An action on the right, such as "Clear". */
  action?: ReactNode;
}

/** The entry flow's top bar: back, progress through the steps, and an optional action. */
export function StepHeader({ step, total, label, backLabel, onBack, action }: StepHeaderProps) {
  return (
    <>
      <IconButton icon="back" label={backLabel} onClick={onBack} className={styles.back} />
      <StepProgress current={step} total={total} label={label} className={styles.progress} />
      {action && <div className={styles.action}>{action}</div>}
    </>
  );
}

/** A text action for the header ("Clear"). */
export function HeaderAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.textAction} onClick={onClick}>
      {children}
    </button>
  );
}
