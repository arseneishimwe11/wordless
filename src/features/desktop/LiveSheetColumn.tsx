import { useState } from 'react';

import { SegmentedControl } from '@/components';
import { copy } from '@/copy/en';
import { keyUnit, type Medicine, type Person } from '@/domain';
import { PillUnit } from '@/graphics';
import { prefsStore, useHousehold, usePrefs } from '@/store';

import { ScaledStage } from '../flow';
import { FridgeSheet } from '../sheet/FridgeSheet';
import { PAGE } from '../sheet/layout';
import styles from './LiveSheetColumn.module.css';

const t = copy.screens.desktop.sheet;

/** The person's medicines with the one being entered in its place (or added at the end). */
export function withDraft(
  person: Person,
  medicine: Medicine,
  editingId: string | null,
): Medicine[] {
  const replaced = person.medicines.some((m) => m.id === (editingId ?? medicine.id));
  return replaced
    ? person.medicines.map((m) => (m.id === (editingId ?? medicine.id) ? medicine : m))
    : [...person.medicines, medicine];
}

/**
 * "The sheet, as you type" (LiveSheet.dc.html): the printed sheet, redrawn with every
 * change, with the medicine being entered marked on it.
 */
export function LiveSheetColumn({
  person,
  medicine,
  editingId,
  saved = false,
}: {
  person: Person;
  medicine: Medicine;
  editingId: string | null;
  /** Just added: the sheet shows it as it will print, with its code. */
  saved?: boolean;
}) {
  const mono = usePrefs((s) => s.mono);
  const preparedBy = useHousehold((s) => s.preparedBy);
  const [today] = useState(() => new Date());
  const medicines = withDraft(person, medicine, editingId);

  return (
    <aside className={styles.column} aria-label={t.label}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 className={styles.title}>{t.title}</h2>
          <span className={styles.sub}>{t.sub}</span>
        </div>
        <SegmentedControl
          label={t.previewAs}
          size={44}
          fit
          options={[
            { value: 'color', label: copy.screens.print.color },
            { value: 'mono', label: copy.screens.print.mono },
          ]}
          value={mono ? 'mono' : 'color'}
          onChange={(value) => {
            prefsStore.getState().setMono(value === 'mono');
          }}
          className={styles.toggle}
        />
      </div>
      {/* A picture of the page: its words are in the list below and in the step's summary. */}
      <div className={styles.paper} aria-hidden="true">
        <ScaledStage width={PAGE.width} height={PAGE.height}>
          <FridgeSheet
            person={{ ...person, medicines }}
            meta={{ preparedBy, preparedOn: null }}
            date={copy.sheet.date(today)}
            mono={mono}
            live={saved ? undefined : { medicineId: medicine.id }}
          />
        </ScaledStage>
      </div>
      <p className={styles.chips}>
        <span className={styles.chipsLabel}>{t.onSheet}</span>
        {medicines.map((m) =>
          m.id === medicine.id && !saved ? (
            <span key={m.id} className={`${styles.chip ?? ''} ${styles.entering ?? ''}`}>
              {t.beingEntered(m.name || copy.screens.unnamed)}
            </span>
          ) : (
            <span key={m.id} className={styles.chip}>
              <PillUnit
                kind={keyUnit(m)}
                color={m.color}
                color2={m.color2}
                score={m.score}
                size={24}
              />
              {m.name || copy.screens.unnamed}
            </span>
          ),
        )}
      </p>
    </aside>
  );
}
