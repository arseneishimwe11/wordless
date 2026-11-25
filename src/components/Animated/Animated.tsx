import type { CSSProperties, ElementType, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Animated.module.css';

/** Each shared keyframe (src/styles/motion.css) with the duration and easing the design pairs it with. */
export const EFFECTS = {
  drop: { keyframes: 'wl-drop', duration: 'drop', ease: 'drop', infinite: false },
  'drop-unit': { keyframes: 'wl-drop-unit', duration: 'drop-unit', ease: 'drop', infinite: false },
  pop: { keyframes: 'wl-pop', duration: 'pop', ease: 'standard', infinite: false },
  stamp: { keyframes: 'wl-stamp', duration: 'stamp', ease: 'stamp', infinite: false },
  print: { keyframes: 'wl-print', duration: 'print', ease: 'print', infinite: false },
  nudge: { keyframes: 'wl-nudge', duration: 'nudge', ease: 'standard', infinite: false },
  fade: { keyframes: 'wl-fade', duration: 'fade', ease: 'standard', infinite: false },
  spin: { keyframes: 'wl-spin', duration: 'spin', ease: 'linear', infinite: true },
} as const;

export type AnimationEffect = keyof typeof EFFECTS;

export interface AnimatedProps {
  effect: AnimationEffect;
  /** Start after this many ms (to stagger a row of pills). */
  delay?: number | undefined;
  /** Change this value to play the animation again (an error count, a selection count). */
  replay?: string | number | undefined;
  as?: ElementType | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * Plays one of the design's animations on its child when it appears, and again
 * whenever `replay` changes. People who prefer reduced motion see the end state.
 */
export function Animated({
  effect,
  delay = 0,
  replay,
  as: Tag = 'span',
  className,
  children,
}: AnimatedProps) {
  const e = EFFECTS[effect];
  const style = {
    '--anim-name': e.keyframes,
    '--anim-duration': `var(--duration-${e.duration})`,
    '--anim-ease': `var(--ease-${e.ease})`,
    '--anim-delay': `${String(delay)}ms`,
    '--anim-count': e.infinite ? 'infinite' : '1',
  } as CSSProperties;
  return (
    <Tag key={replay} className={cx(styles.animated, className)} style={style}>
      {children}
    </Tag>
  );
}
