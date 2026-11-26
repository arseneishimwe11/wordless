import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import { PAGE } from './layout';
import styles from './SheetPage.module.css';

export interface SheetPageProps {
  /** For a black and white printer: white paper, every colour in grey. */
  mono?: boolean | undefined;
  label?: string | undefined;
  /** Which printable this page belongs to, for tests and print counts. */
  kind: 'sheet' | 'strips';
  className?: string | undefined;
  children: ReactNode;
}

/**
 * One A4 page, 794 × 1123 CSS px (210 × 297 mm at 96 dpi). Content is placed on it in
 * the design's own coordinates. On screen it is shown scaled; in print, at full size.
 */
export function SheetPage({ mono = false, label, kind, className, children }: SheetPageProps) {
  return (
    <section
      aria-label={label}
      data-page={kind}
      className={cx(styles.page, mono && styles.mono, className)}
      style={{ width: PAGE.width, height: PAGE.height }}
    >
      {children}
    </section>
  );
}
