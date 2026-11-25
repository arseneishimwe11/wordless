import type { CSSProperties } from 'react';

import { isDevice, isSmallUnit, pillUnits, type PillForm } from '@/domain/pillUnits';

import type { PillColor } from '../pillColors';
import { PillUnit } from '../PillUnit';
import styles from './PillStack.module.css';

/**
 * Unit sizes per context, from the design. Main units shrink as more are drawn
 * (index = number of main units, capped at 5); drops and puffs stay small; the
 * dropper and inhaler are drawn as the device.
 */
export const STACK_SIZES = {
  /** Pill Builder on the phone. */
  builder: { main: [132, 132, 110, 90, 78, 66], drop: 34, puff: 40, device: 108 },
  /** Pill Builder on the desktop. */
  'builder-desktop': { main: [176, 176, 140, 112, 96, 80], drop: 50, puff: 58, device: 150 },
  /** A cell on the printed sheet. */
  sheet: { main: [60, 60, 46, 38, 32, 28], drop: 20, puff: 20, device: 50 },
  /**
   * A cell of the Household screen's "Today" grid. The design draws one unit at 40;
   * the rest follow the sheet's proportions (two thirds).
   */
  today: { main: [40, 40, 31, 25, 21, 19], drop: 14, puff: 14, device: 34 },
  /** A cell of the printed fridge sheet: one unit at 66 (FridgeSheet.dc.html), the rest in proportion. */
  fridge: { main: [66, 66, 50, 42, 35, 31], drop: 22, puff: 22, device: 55 },
  /** A daily strip: one unit at 36 (DailyStrip.dc.html), the rest in proportion. */
  strip: { main: [36, 36, 28, 23, 19, 17], drop: 12, puff: 12, device: 30 },
} as const;

export type StackContext = keyof typeof STACK_SIZES;

export interface PillStackProps {
  form: PillForm;
  qty: number;
  color: PillColor;
  color2?: PillColor | undefined;
  score?: boolean | undefined;
  context: StackContext;
  /** Pull each unit this many px over the previous one. */
  overlap?: number | undefined;
  /** The whole dose in words, for screen readers ("1½ tablets, white"). */
  label?: string | undefined;
  className?: string | undefined;
}

/** A dose, drawn unit by unit: counting by drawing it again, never by writing a number. */
export function PillStack({
  form,
  qty,
  color,
  color2,
  score = false,
  context,
  overlap = 0,
  label,
  className,
}: PillStackProps) {
  const sizes = STACK_SIZES[context];
  const units = pillUnits(form, qty);
  const mainCount = units.filter((k) => !isSmallUnit(k)).length;
  const mainSize = sizes.main[Math.min(5, mainCount)] ?? sizes.main[5];
  const style = { '--stack-overlap': `${String(-overlap)}px` } as CSSProperties;

  return (
    <span
      className={[styles.stack, className].filter(Boolean).join(' ')}
      style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {units.map((kind, i) => {
        const size =
          kind === 'drop'
            ? sizes.drop
            : kind === 'puff'
              ? sizes.puff
              : isDevice(kind)
                ? sizes.device
                : mainSize;
        return (
          <PillUnit key={i} kind={kind} color={color} color2={color2} score={score} size={size} />
        );
      })}
    </span>
  );
}
