import type { ElementType, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './HandNote.module.css';

export type HandNoteSize = 15 | 17 | 18 | 19 | 20 | 21 | 22;

export interface HandNoteProps {
  size?: HandNoteSize | undefined;
  /** Pen ink for hints; the error colour when the note explains what is missing. */
  tone?: 'pen' | 'error' | undefined;
  as?: ElementType | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * The pharmacist's pen: a handwritten hint ("tap the sky — or drag the sun").
 * Only for the person entering the prescription, never an instruction to the patient.
 */
export function HandNote({
  size = 17,
  tone = 'pen',
  as: Tag = 'p',
  className,
  children,
}: HandNoteProps) {
  return (
    <Tag
      className={cx(styles.note, tone === 'error' && styles.error, className)}
      style={{ fontSize: `var(--text-${String(size)})` }}
    >
      {children}
    </Tag>
  );
}
