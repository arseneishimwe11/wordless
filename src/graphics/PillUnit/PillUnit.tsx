import type { PillUnitKind } from '@/domain/pillUnits';

import { Graphic } from '../Graphic';
import { pillShapes } from '../generated/pillShapes';
import { pillSlots, type PillColor } from '../pillColors';

export interface PillUnitProps {
  kind: PillUnitKind;
  /** The pill's colour; for a capsule, the cap. */
  color: PillColor;
  /** A capsule's body colour. Defaults to `color`. */
  color2?: PillColor | undefined;
  /** Draw the score line across a tablet. */
  score?: boolean | undefined;
  /** Width and height in px. Defaults to 48. */
  size?: number | undefined;
  label?: string | undefined;
  className?: string | undefined;
}

/** One unit of a dose, drawn as it looks in the hand: colour, pattern, score line. */
export function PillUnit({
  kind,
  color,
  color2,
  score = false,
  size = 48,
  label,
  className,
}: PillUnitProps) {
  return (
    <Graphic
      data={pillShapes[kind]}
      width={size}
      height={size}
      slots={pillSlots(color, color2, score)}
      label={label}
      className={className}
    />
  );
}
