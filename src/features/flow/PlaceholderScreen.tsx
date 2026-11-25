import { useNavigate } from 'react-router';

import { IconButton } from '@/components';
import { copy } from '@/copy/en';

import { ScreenLayout } from './ScreenLayout';
import styles from './PlaceholderScreen.module.css';

/** A screen that is planned but not built yet: says so, and offers the way back. */
export function PlaceholderScreen({ title, body }: { title: string; body: string }) {
  const navigate = useNavigate();
  return (
    <ScreenLayout
      header={
        <>
          <IconButton
            icon="back"
            label={copy.screens.back}
            className={styles.back}
            onClick={() => {
              void navigate(-1);
            }}
          />
          <h1 className={styles.title}>{title}</h1>
        </>
      }
    >
      <p className={styles.body}>{body}</p>
    </ScreenLayout>
  );
}
