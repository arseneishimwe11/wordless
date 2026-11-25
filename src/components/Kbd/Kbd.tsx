import type { ReactNode } from 'react';

import styles from './Kbd.module.css';

/** A key on the keyboard, drawn as a little key cap ("Enter", "Tab", "1"). */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}
