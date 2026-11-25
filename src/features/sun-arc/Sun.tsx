import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

import { Animated } from '@/components';
import { nearestTime, TIMES, type TimeOfDay } from '@/domain';
import { Glyph, Illustration } from '@/graphics';
import { sunRays } from '@/graphics/generated/illustrations/sun-rays';

import { phaseColor } from '../flow';
import { arcPoint, NIGHT_BELOW, pointAngle } from './geometry';
import styles from './Sun.module.css';
import type { SunMotion } from './useSun';

export interface SunProps {
  sun: SunMotion;
  label: string;
  /** Plays the nudge, again each time this changes (Next pressed with no times). */
  nudge: number;
  onDrop: (time: TimeOfDay) => void;
  onPress: (time: TimeOfDay) => void;
  onStep: (direction: 1 | -1) => void;
  onTouch: () => void;
}

/** A drag only counts once the finger has moved this far, in px. */
const DRAG_THRESHOLD = 6;

/**
 * The sun on the arc. Drag it along the sky and let go to add a dose where it lands;
 * press it to add or remove the dose at its stop; arrow keys move it stop to stop.
 */
export function Sun({ sun, label, nudge, onDrop, onPress, onStep, onTouch }: SunProps) {
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const { x, y } = arcPoint(sun.angle);
  const near = nearestTime(sun.angle);
  const { phase } = TIMES[near];
  const night = sun.angle < NIGHT_BELOW;

  /** The pointer, in the stage's own 390 × 356 coordinates. */
  const angleAt = (event: PointerEvent<HTMLButtonElement>) => {
    const stage = event.currentTarget.closest('[data-arc]');
    if (!stage) return sun.current();
    const box = stage.getBoundingClientRect();
    const scale = box.width / 390 || 1;
    return pointAngle({
      x: (event.clientX - box.left) / scale,
      y: (event.clientY - box.top) / scale,
    });
  };

  const down = (event: PointerEvent<HTMLButtonElement>) => {
    sun.stop();
    sun.set(sun.current());
    justDragged.current = false;
    drag.current = { x: event.clientX, y: event.clientY, moved: false };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Not every environment can capture the pointer; the drag still works without it.
    }
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(event.clientX - d.x, event.clientY - d.y) < DRAG_THRESHOLD) return;
    d.moved = true;
    onTouch();
    sun.set(angleAt(event));
  };

  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    justDragged.current = true;
    onDrop(nearestTime(sun.current()));
  };

  const key = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') onStep(-1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') onStep(1);
    else return;
    event.preventDefault();
  };

  return (
    <div className={styles.anchor} style={{ left: x, top: y }}>
      <button
        type="button"
        aria-label={label}
        className={styles.sun}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        onClick={() => {
          if (justDragged.current) {
            justDragged.current = false;
            return;
          }
          // Pressed while still travelling: the dose goes where the sun is heading.
          onPress(nearestTime(sun.heading()));
        }}
      >
        <Animated effect="nudge" replay={nudge} className={styles.body}>
          {night ? (
            <>
              <span className={styles.moonShadow} />
              <span className={styles.moon}>
                <Glyph name="moon" size={40} />
              </span>
            </>
          ) : (
            <>
              <Animated effect="spin" className={styles.rays}>
                <Illustration data={sunRays} width={68} />
              </Animated>
              <span className={styles.slip} style={{ background: phaseColor(phase, 'tint') }} />
              <span className={styles.disc} style={{ background: phaseColor(phase, 'ink') }} />
            </>
          )}
        </Animated>
      </button>
    </div>
  );
}
