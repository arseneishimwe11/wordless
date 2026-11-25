import { HouseholdMark, type HouseholdMarkId } from '@/graphics';
import { cx } from '@/lib/cx';

import choice from '../choice.module.css';
import { useOptionGroup } from '../OptionGroup';
import styles from './PersonChip.module.css';

export interface PersonChipProps {
  mark: HouseholdMarkId;
  /** The pharmacist's name for this person ("Grandmother"). */
  name: string;
  checked: boolean;
  onChange: () => void;
  inputName?: string | undefined;
}

/** A person in the household: their mark and name. The chosen one is drawn in ink. */
export function PersonChip({ mark, name, checked, onChange, inputName }: PersonChipProps) {
  const group = useOptionGroup();
  return (
    <label className={cx(choice.option, styles.chip)}>
      <input
        type="radio"
        name={inputName ?? group?.name}
        value={mark}
        checked={checked}
        onChange={onChange}
        className={choice.input}
      />
      <span className={styles.face}>
        <HouseholdMark mark={mark} size={34} />
        {name}
      </span>
    </label>
  );
}
