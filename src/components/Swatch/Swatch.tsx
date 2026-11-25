import { Glyph, type PillColor } from '@/graphics';
import { cx } from '@/lib/cx';

import choice from '../choice.module.css';
import { useOptionGroup } from '../OptionGroup';
import styles from './Swatch.module.css';

export interface SwatchProps {
  color: PillColor;
  /** Colour and pattern in words ("Blue, zigzag"): the swatch shows no text. */
  label: string;
  checked: boolean;
  onChange: () => void;
  /** 48 on phones, 56 on desktop. */
  size?: 48 | 56 | undefined;
  /** The colour behind the ring: the page (paper) or a card (surface). */
  ring?: 'paper' | 'surface' | undefined;
  name?: string | undefined;
}

/** One pill colour with its pattern; a ring shows the chosen one. */
export function Swatch({
  color,
  label,
  checked,
  onChange,
  size = 48,
  ring = 'paper',
  name,
}: SwatchProps) {
  const group = useOptionGroup();
  return (
    <label className={cx(choice.option, styles.swatch)}>
      <input
        type="radio"
        name={name ?? group?.name}
        value={color}
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={choice.input}
      />
      <span
        className={cx(
          styles.face,
          size === 56 && styles.large,
          ring === 'surface' && styles.onSurface,
        )}
      >
        <Glyph name={`swatch-${color}`} size={size === 56 ? 50 : 44} />
      </span>
    </label>
  );
}
