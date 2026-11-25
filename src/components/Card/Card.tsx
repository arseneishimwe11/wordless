import type { ElementType, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Card.module.css';

export type CardVariant = 'well' | 'surface' | 'dashed' | 'panel' | 'feature' | 'sheet' | 'phone';

export interface CardProps {
  /**
   * `well`: a quiet paper-deep area (medicine summary, Pill Builder well).
   * `surface`: a bordered card. `dashed`: an empty state ("nothing here yet").
   * `panel`: the desktop step panel. `feature`: a landing page card.
   * `sheet`: a printed page on screen. `phone`: a phone screen frame.
   */
  variant: CardVariant;
  as?: ElementType | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

/** The design's surfaces, each with its own hand-drawn corners. Padding is the caller's. */
export function Card({ variant, as: Tag = 'div', className, children }: CardProps) {
  return <Tag className={cx(styles.card, styles[variant], className)}>{children}</Tag>;
}
