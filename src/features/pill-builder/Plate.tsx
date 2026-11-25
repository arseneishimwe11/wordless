import { Animated, Checkbox } from '@/components';
import { copy } from '@/copy/en';
import { canHaveScore, isDevice, isSmallUnit, pillUnits, quantity, type Medicine } from '@/domain';
import { Illustration, PillUnit, STACK_SIZES } from '@/graphics';
import { builderWell } from '@/graphics/generated/illustrations/builder-well';

import styles from './Plate.module.css';

const sizes = STACK_SIZES.builder;

export interface PlateProps {
  medicine: Medicine;
  onScoreChange: (score: boolean) => void;
}

/**
 * The dose on a plate, drawn as it will look in the hand. Each change drops the
 * units in again, one after another.
 */
export function Plate({ medicine, onScoreChange }: PlateProps) {
  const units = pillUnits(medicine.form, medicine.qty);
  const mainCount = units.filter((k) => !isSmallUnit(k)).length;
  const main = sizes.main[Math.min(5, mainCount)] ?? sizes.main[5];
  const small = medicine.form === 'drops' ? sizes.drop : sizes.puff;
  const replay = `${medicine.form}-${medicine.color}-${medicine.color2}-${String(medicine.qty)}`;

  return (
    <div className={styles.well}>
      <Illustration data={builderWell} width={358} className={styles.plate} />
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
