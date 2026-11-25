import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Icon } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './ListRow.module.css';

export interface ListRowProps {
  href: string;
  /** A drawing (the medicine's pill), decorative: the title names the row. */
  media?: ReactNode;
  title: string;
  subtitle?: string | undefined;
  /** Runs before the link is followed (to set up what the next screen shows). */
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

/** A tappable row in a list: drawing, title, details, and a chevron. */
export function ListRow({ href, media, title, subtitle, onClick, className }: ListRowProps) {
  return (
    <Link to={href} className={cx(styles.row, className)} onClick={onClick}>
      {media && (
        <span className={styles.media} aria-hidden="true">
          {media}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {/* A space keeps title and details apart in the link's accessible name. */}
        {subtitle && ' '}
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      <Icon name="back" className={styles.chevron} />
    </Link>
  );
}
