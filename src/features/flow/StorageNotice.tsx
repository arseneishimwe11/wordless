import { copy } from '@/copy/en';
import { useHousehold } from '@/store';

import styles from './StorageNotice.module.css';

/**
 * Says when saved schedules couldn't be read, or saving fails, so nobody believes a
 * schedule is kept when it isn't. Not in the design; worded in copy.
 */
export function StorageNotice() {
  const loadError = useHousehold((s) => s.loadError);
  const saveFailed = useHousehold((s) => s.saveFailed);
  const message = loadError
    ? copy.screens.notices[loadError]
    : saveFailed
      ? copy.screens.notices.saveFailed
      : null;
  if (!message) return null;
  return (
    <p role="status" className={styles.notice}>
      {message}
    </p>
  );
}
