/**
 * Data shape of every generated drawing (src/graphics/generated/*).
 *
 * A drawing is a tree of SVG elements. Attribute names are already React prop
 * names (`strokeWidth`). Paint values (fill, stroke) are encoded so no raw colour
 * reaches the app:
 *   'c:ink'     → the colour token --color-ink
 *   'p:dots'    → the shared fill pattern #wl-p-dots (see PatternDefs)
 *   's:base'    → a slot filled in at render time (pills: base, pattern, base2, pattern2, score)
 *   'none', 'currentColor' → as is
 * Slots may also appear in non-paint attributes (the score line's opacity).
 */

export const SVG_TAGS = [
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'defs',
  'pattern',
] as const;

export type SvgTag = (typeof SVG_TAGS)[number];

export type SvgAttrs = Readonly<Record<string, string>>;

export type SvgNode = readonly [tag: SvgTag, attrs: SvgAttrs, children?: readonly SvgNode[]];

export interface GraphicData {
  viewBox: string;
  nodes: readonly SvgNode[];
}

/** Template slots used by pill drawings. */
export const PILL_SLOTS = ['base', 'pattern', 'base2', 'pattern2', 'score'] as const;

export type PillSlot = (typeof PILL_SLOTS)[number];

export type SlotValues = Partial<Record<PillSlot, string>>;
