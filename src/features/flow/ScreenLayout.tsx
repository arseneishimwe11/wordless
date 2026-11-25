import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './ScreenLayout.module.css';

export interface ScreenLayoutProps {
  /** The top bar: back, progress, actions. */
  header?: ReactNode;
  /** The call to action, kept in reach at the bottom of the screen. */
  footer?: ReactNode;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * A phone screen: a single column, header at the top and the call to action pinned
 * to the bottom while the content scrolls between them. On wider screens the column
 * stays phone-width and centred.
 */
export function ScreenLayout({ header, footer, className, children }: ScreenLayoutProps) {
  return (
    <div className={styles.screen}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.main}>
        <div className={cx(styles.body, className)}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
