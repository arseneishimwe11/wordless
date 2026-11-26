import { Animated, Checkbox, HandNote } from '@/components';
import { copy } from '@/copy/en';
import { canHaveScore, isDevice, isSmallUnit, pillUnits, quantity, type Medicine } from '@/domain';
import { Illustration, PillUnit, STACK_SIZES } from '@/graphics';
import { builderWell } from '@/graphics/generated/illustrations/builder-well';
import { builderWellDesktop } from '@/graphics/generated/illustrations/builder-well-desktop';
import { cx } from '@/lib/cx';

import styles from './Plate.module.css';

export interface PlateProps {
  medicine: Medicine;
  onScoreChange: (score: boolean) => void;
  /** The phone's 172px well, or the desktop's 420px one with its note. */
  size?: 'phone' | 'desktop' | undefined;
}

/**
 * The dose on a plate, drawn as it will look in the hand. Each change drops the
 * units in again, one after another.
 */
export function Plate({ medicine, onScoreChange, size = 'phone' }: PlateProps) {
  const desktop = size === 'desktop';
  const sizes = STACK_SIZES[desktop ? 'builder-desktop' : 'builder'];
  const units = pillUnits(medicine.form, medicine.qty);
  const mainCount = units.filter((k) => !isSmallUnit(k)).length;
  const main = sizes.main[Math.min(5, mainCount)] ?? sizes.main[5];
  const small = medicine.form === 'drops' ? sizes.drop : sizes.puff;
  const replay = `${medicine.form}-${medicine.color}-${medicine.color2}-${String(medicine.qty)}`;

  return (
    <div className={cx(styles.well, desktop && styles.desktop)}>
      {desktop ? (
        <Illustration data={builderWellDesktop} width={320} className={styles.plateDesktop} />
      ) : (
        <Illustration data={builderWell} width={358} className={styles.plate} />
      )}
      {desktop && (
        <HandNote size={19} className={styles.note}>
          {copy.screens.desktop.pillNote}
        </HandNote>
      )}
      <div
        className={styles.units}
        role="img"
        aria-label={`${quantity(medicine, copy.domain)}, ${copy.domain.colors[medicine.color]}`}
      >
        {units.map((kind, i) => {
          const size = isSmallUnit(kind) ? small : isDevice(kind) ? sizes.device : main;
          return (
            <Animated key={`${replay}-${String(i)}`} effect="drop-unit" delay={i * 70}>
              <PillUnit
                kind={kind}
                color={medicine.color}
                color2={medicine.color2}
                score={medicine.score}
                size={size}
              />
            </Animated>
          );
        })}
      </div>
      {canHaveScore(medicine.form) && (
        <Checkbox
          variant="pill"
          label={copy.screens.medicine.scoreLine}
          checked={medicine.score}
          onChange={(event) => {
            onScoreChange(event.currentTarget.checked);
          }}
          className={styles.score}
        />
      )}
    </div>
  );
}
