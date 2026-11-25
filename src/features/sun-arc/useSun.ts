import { useCallback, useEffect, useRef, useState } from 'react';

import { sunTravelMs } from '@/domain';

import { clampSwing, overshoot } from './geometry';

/** People who prefer reduced motion (and test environments without matchMedia) see the sun jump. */
const prefersReducedMotion = () =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface SunMotion {
  /** Where the sun is drawn now, in degrees along the arc. */
  angle: number;
  /** The same, read inside event handlers without waiting for a render. */
  current: () => number;
  /** Where the sun is heading (where it is, once it has settled). */
  heading: () => number;
  /** Puts the sun somewhere at once (while dragging). */
  set: (angle: number) => void;
  /** Sends the sun somewhere: it travels there and settles with a small overshoot. */
  travel: (to: number, ms?: number) => void;
  /** Lets the sun jump to `from`, then sweep to `to` after a moment (presets). */
  sweep: (from: number, to: number, ms: number) => void;
  stop: () => void;
}

export function useSun(initial: number): SunMotion {
  const [angle, setAngle] = useState(initial);
  const ref = useRef(initial);
  const target = useRef(initial);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((value: number) => {
    ref.current = value;
    setAngle(value);
  }, []);

  const set = useCallback(
    (value: number) => {
      target.current = value;
      show(value);
    },
    [show],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearTimeout(timer.current);
  }, []);

  const travel = useCallback(
    (to: number, ms?: number) => {
      cancelAnimationFrame(frame.current);
      const from = ref.current;
      target.current = to;
      if (prefersReducedMotion() || Math.abs(to - from) < 0.5) {
        show(to);
        return;
      }
      const duration = ms ?? sunTravelMs(from, to);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        show(t >= 1 ? to : clampSwing(from + (to - from) * overshoot(t)));
        if (t < 1) frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    [show],
  );

  const sweep = useCallback(
    (from: number, to: number, ms: number) => {
      stop();
      set(from);
      target.current = to;
      timer.current = setTimeout(() => {
        travel(to, ms);
      }, 20);
    },
    [set, stop, travel],
  );

  useEffect(() => stop, [stop]);

  return {
    angle,
    current: () => ref.current,
    heading: () => target.current,
    set,
    travel,
    sweep,
    stop,
  };
}
