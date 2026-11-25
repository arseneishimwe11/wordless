import type { ElementType, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Eyebrow.module.css';

export interface EyebrowProps {
  /** 14 (boards, cards) or 15 (landing page). */
  size?: 14 | 15 | undefined;
  as?: ElementType | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/** A small uppercase line above a heading ("FOR PHARMACIES, CLINICS AND HEALTH WORKERS"). */
export function Eyebrow({ size = 14, as: Tag = 'p', className, children }: EyebrowProps) {
  return (
    <Tag className={cx(styles.eyebrow, size === 15 && styles.large, className)}>{children}</Tag>
  );
}
