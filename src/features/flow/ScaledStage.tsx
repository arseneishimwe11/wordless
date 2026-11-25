import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './ScaledStage.module.css';

export interface ScaledStageProps {
  /** The drawing's own size, in the design's px. */
  width: number;
  height: number;
  /** Run the stage from edge to edge of the screen, past the column's padding. */
  bleed?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * Lays its children out in the design's own coordinates (the Sun Arc's 390 × 356) and
 * scales the whole drawing to the width available, so a 320px phone gets the same
 * picture, smaller. Pointer positions inside can be read with getBoundingClientRect.
 */
export function ScaledStage({
  width,
  height,
  bleed = false,
  className,
  children,
}: ScaledStageProps) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = outer.current;
    if (!element) return undefined;
    const measure = () => {
      // Unlaid-out (tests, hidden): keep the design size.
      if (element.clientWidth > 0) setScale(element.clientWidth / width);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [width]);

  return (
    <div
      ref={outer}
      className={cx(styles.stage, bleed && styles.bleed, className)}
      style={{ height: height * scale }}
    >
      <div className={styles.inner} style={{ width, height, transform: `scale(${String(scale)})` }}>
        {children}
      </div>
    </div>
  );
}
