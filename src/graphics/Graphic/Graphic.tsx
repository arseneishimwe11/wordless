import { renderSvgNodes } from '../renderSvgNodes';
import type { GraphicData, SlotValues } from '../types';

export interface GraphicProps {
  data: GraphicData;
  /** Rendered width in px. Defaults to the drawing's own width. */
  width?: number | undefined;
  /** Rendered height in px. Defaults to keeping the drawing's proportions. */
  height?: number | undefined;
  /**
   * What the drawing shows, for screen readers. Leave it out for decorative
   * drawings (they are then hidden from assistive technology).
   */
  label?: string | undefined;
  slots?: SlotValues | undefined;
  className?: string | undefined;
}

function viewBoxSize(viewBox: string): [number, number] {
  const [, , w = 0, h = 0] = viewBox.split(/\s+/).map(Number);
  return [w, h];
}

/** Draws any generated graphic. Ink is allowed to spill past the box, as in the design. */
export function Graphic({ data, width, height, label, slots, className }: GraphicProps) {
  const [vw, vh] = viewBoxSize(data.viewBox);
  const w = width ?? (height !== undefined && vh ? (height * vw) / vh : vw);
  const h = height ?? (vw ? (w * vh) / vw : vh);
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);

  return (
    <svg
      viewBox={data.viewBox}
      width={w}
      height={h}
      overflow="visible"
      focusable="false"
      className={className}
      {...a11y}
    >
      {renderSvgNodes(data.nodes, slots)}
    </svg>
  );
}
