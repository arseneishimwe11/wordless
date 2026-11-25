import { IconButton } from '@/components';
import { copy } from '@/copy/en';
import { keyUnit, type Medicine } from '@/domain';
import { PillUnit } from '@/graphics';

import { STEP_PATHS } from './paths';
import styles from './MedicineCard.module.css';

export interface MedicineCardProps {
  medicine: Medicine;
  /** The line under the name: "1 capsule each time". */
  detail: string;
}

/** The medicine being entered, at the top of steps 2–4, with a way back to change it. */
export function MedicineCard({ medicine, detail }: MedicineCardProps) {
  const unit = keyUnit(medicine);
  return (
    <div className={styles.card}>
      <span className={styles.media} aria-hidden="true">
        <PillUnit
          kind={unit}
          color={medicine.color}
          color2={medicine.color2}
          score={medicine.score}
          size={unit === 'capsule' ? 58 : 50}
        />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{medicine.name || copy.screens.unnamed}</span>
        {/* A space keeps name and detail apart for screen readers. */}{' '}
        <span className={styles.detail}>{detail}</span>
      </span>
      <IconButton icon="edit" label={copy.screens.changeMedicine} href={STEP_PATHS.medicine} />
    </div>
  );
}
