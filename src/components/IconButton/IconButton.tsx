import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';

import { Icon, type IconName } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type' | 'aria-label'
> {
  icon: IconName;
  /** What the button does. Required: an icon alone says nothing to a screen reader. */
  label: string;
  /** Renders a link to this app path instead of a button. */
  href?: string | undefined;
  /** Mirror the icon (a "forward" chevron from the back icon). */
  flip?: boolean | undefined;
}

/** A 48px round, borderless icon control: back, edit. */
export function IconButton({
  icon,
  label,
  href,
  flip = false,
  className,
  ...rest
}: IconButtonProps) {
  const classes = cx(styles.iconButton, className);
  const glyph = <Icon name={icon} className={cx(flip && styles.flip)} />;
  if (href !== undefined) {
    return (
      <Link to={href} className={classes} aria-label={label}>
        {glyph}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} aria-label={label} {...rest}>
      {glyph}
    </button>
  );
}

export type { IconButtonProps };
