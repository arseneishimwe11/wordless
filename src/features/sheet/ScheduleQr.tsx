import { create } from 'qrcode';

import { copy } from '@/copy/en';
import { encodeSchedule, type Person, type ScheduleMeta } from '@/domain';

import styles from './ScheduleQr.module.css';

/** The quiet margin a scanner needs around the code, in modules. */
const QUIET = 2;

/** One path for the dark modules: smaller than a rect per module, and crisp when printed. */
export function qrModules(text: string): { size: number; path: string } {
  const { modules } = create(text, { errorCorrectionLevel: 'M' });
  let path = '';
  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (modules.get(row, col)) path += `M${String(col + QUIET)} ${String(row + QUIET)}h1v1h-1z`;
    }
  }
  return { size: modules.size + QUIET * 2, path };
}

/** Modules smaller than this (in CSS px, about 0.4 mm in print) are hard to scan. */
const MIN_MODULE = 1.5;

export interface ScheduleQrProps {
  person: Person;
  meta: ScheduleMeta;
  /** The design's box: 104 px inside a 120 px frame. */
  size?: number | undefined;
}

/**
 * The whole schedule as a QR code, so the next clinic can scan it back in. A long
 * schedule (many medicines, non-Latin names) grows the code rather than shrinking its
 * modules below what a phone camera can read.
 */
export function ScheduleQr({ person, meta, size = 104 }: ScheduleQrProps) {
  const { size: modules, path } = qrModules(encodeSchedule(person, meta));
  const width = Math.max(size, modules * MIN_MODULE);
  return (
    <svg
      viewBox={`0 0 ${String(modules)} ${String(modules)}`}
      width={width}
      height={width}
      role="img"
      aria-label={copy.sheet.qrLabel}
      shapeRendering="crispEdges"
      className={styles.qr}
    >
      <rect width={modules} height={modules} className={styles.light} />
      <path d={path} className={styles.dark} />
    </svg>
  );
}
