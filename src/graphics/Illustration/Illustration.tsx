import { Graphic } from '../Graphic';
import type { GraphicData } from '../types';

export interface IllustrationProps {
  /**
   * The drawing, imported from its own module so each page loads only the drawings it shows:
   * `import { medicineBox } from '@/graphics/generated/illustrations/medicine-box'`.
   */
  data: GraphicData;
  /** Width in px; height follows the drawing's proportions. Defaults to the drawing's own size. */
  width?: number | undefined;
  label?: string | undefined;
  className?: string | undefined;
}

/** A larger drawing: the logo, the medicine box, the sun's path, the Sun Arc stage. */
export function Illustration({ data, width, label, className }: IllustrationProps) {
  return <Graphic data={data} width={width} label={label} className={className} />;
}
