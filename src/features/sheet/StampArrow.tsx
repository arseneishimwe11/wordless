import { At } from './parts';
import styles from './StampArrow.module.css';

/**
 * The dotted arrow from the last box to the "course finished" stamp. Two strokes
 * drawn here: the design gives this one no viewBox, so it isn't extracted.
 */
export function StampArrow({ left, top }: { left: number; top: number }) {
  return (
    <At left={left} top={top} width={24} height={24}>
      <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" className={styles.arrow}>
        <path d="M2 12 L15 12" strokeDasharray="0.01 6" />
        <path d="M11 6 L17 12 L11 18" />
      </svg>
    </At>
  );
}
