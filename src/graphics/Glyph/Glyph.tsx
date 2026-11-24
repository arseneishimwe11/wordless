import { Graphic } from '../Graphic';
import { glyphs, type GlyphName } from '../generated/glyphs';

export interface GlyphProps {
  name: GlyphName;
  /** Width and height in px (the drawing is square). Defaults to 48. */
  size?: number | undefined;
  /** What it means here ("Sunrise", "1 capsule"). Leave out when the meaning is already in text. */
  label?: string | undefined;
  className?: string | undefined;
}

/** A pictogram on the 48-unit grid: a time of day, a rule, a mark, a swatch. */
export function Glyph({ name, size = 48, label, className }: GlyphProps) {
  return (
    <Graphic data={glyphs[name]} width={size} height={size} label={label} className={className} />
  );
}
