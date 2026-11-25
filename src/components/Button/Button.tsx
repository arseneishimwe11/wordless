import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

import { Icon, type IconName } from '@/graphics';
import { cx } from '@/lib/cx';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'dashed' | 'text';
export type ButtonSize = 48 | 52 | 56 | 60 | 64;

interface CommonProps {
  variant?: ButtonVariant | undefined;
  /** Height in px, from the design: 56 on phones, 60 for desktop Continue, 64 for big calls to action. */
  size?: ButtonSize | undefined;
  /**
   * "Not ready yet": drawn quieter (dashed, no shadow) but still pressable, so pressing
   * it can explain what is missing. Never use `disabled` for this.
   */
  pending?: boolean | undefined;
  iconStart?: IconName | undefined;
  iconEnd?: IconName | undefined;
  /** Keyboard hints shown inside the button (e.g. <Kbd>Enter</Kbd>). */
  hint?: ReactNode;
  fullWidth?: boolean | undefined;
  /** Desktop weight: the thinner desktop border, and 17px text at size 56 ("Back"). */
  desktop?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | 'type'> & {
    href?: undefined;
    type?: 'button' | 'submit' | undefined;
  };

type AsLink = CommonProps & {
  /** Renders a link. App paths ("/when") use client-side navigation. */
  href: string;
  onClick?: (() => void) | undefined;
};

export type ButtonProps = AsButton | AsLink;

const isAppPath = (href: string) => href.startsWith('/') && !href.startsWith('//');

/** The design's buttons: primary (ink, saffron shadow), secondary, dashed and text. */
export function Button({
  variant = 'primary',
  size = 56,
  pending = false,
  iconStart,
  iconEnd,
  hint,
  fullWidth = false,
  desktop = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cx(
    styles.button,
    styles[variant],
    styles[`size${String(size)}`],
    pending && styles.pending,
    fullWidth && styles.fullWidth,
    desktop && styles.desktop,
    className,
  );
  const content = (
    <>
      {iconStart && <Icon name={iconStart} className={styles.icon} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} className={styles.icon} />}
      {/* Key hints are a visual aid; the button's name is its words alone. */}
      {hint && (
        <span className={styles.hint} aria-hidden="true">
          {hint}
        </span>
      )}
    </>
  );

  if (rest.href !== undefined) {
    const { href, onClick } = rest;
    return isAppPath(href) ? (
      <Link to={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  const { href: _href, type = 'button', ...buttonProps } = rest;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
