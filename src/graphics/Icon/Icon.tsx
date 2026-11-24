import { Graphic } from '../Graphic';
import { icons, type IconName } from '../generated/icons';

export interface IconProps {
  name: IconName;
  /** Width in px. Defaults to the icon's own size (24–44). */
  size?: number | undefined;
  /** Only for icons that stand alone without text; usually the button carries the label. */
  label?: string | undefined;
  className?: string | undefined;
}

/** An interface icon. It is drawn in currentColor, so it takes the colour of its text. */
export function Icon({ name, size, label, className }: IconProps) {
  return <Graphic data={icons[name]} width={size} label={label} className={className} />;
}
