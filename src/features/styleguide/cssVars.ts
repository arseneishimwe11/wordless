import type { CSSProperties } from 'react';

/** Inline style that may also set CSS custom properties (for per-item token choices). */
export type StyleWithVars = CSSProperties & Record<`--${string}`, string>;

/** `tokenVar('radius', 'cell-1')` → `var(--radius-cell-1)` */
export const tokenVar = (group: string, key: string) => `var(--${group}-${key})`;
