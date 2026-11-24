import { copy } from '@/copy/en';
import type { PillUnitKind } from '@/domain/pillUnits';
import { pillUnits } from '@/domain/pillUnits';
import {
  Glyph,
  HOUSEHOLD_MARKS,
  HouseholdMark,
  PILL_COLORS,
  PillUnit,
  type PillColor,
} from '@/graphics';

import styles from './PillBoard.module.css';

const t = copy.styleguide.pills;

/** The board's showcase: each form at 124px, in the colours the design shows it. */
const FORMS: readonly {
  key: keyof typeof t.forms;
  kind: PillUnitKind;
  color: PillColor;
  color2?: PillColor;
  score?: boolean;
}[] = [
  { key: 'tablet', kind: 'tablet', color: 'white', score: true },
  { key: 'half', kind: 'half', color: 'white' },
  { key: 'oval', kind: 'oval', color: 'pink', score: true },
  { key: 'capsule', kind: 'capsule', color: 'red', color2: 'yellow' },
  { key: 'liquid', kind: 'spoon', color: 'orange' },
  { key: 'drops', kind: 'dropper', color: 'orange' },
];

/**
 * "How many", drawn with the app's own rule (pillUnits). The design board took two
 * shortcuts here (three bare drops, two inhalers); the Pill Builder and the printed
 * sheets draw the dropper or inhaler, then one drop or puff each, so that is shown.
 */
const COUNTS = [
  { key: 'one', units: pillUnits('tablet', 1), color: 'white' },
  { key: 'half', units: pillUnits('tablet', 0.5), color: 'white' },
  { key: 'oneHalf', units: pillUnits('tablet', 1.5), color: 'white' },
  { key: 'two', units: pillUnits('tablet', 2), color: 'white' },
  { key: 'spoon', units: pillUnits('liquid', 5), color: 'orange' },
  { key: 'twoSpoons', units: pillUnits('liquid', 10), color: 'orange' },
  { key: 'drops', units: pillUnits('drops', 3), color: 'orange' },
  { key: 'puffs', units: pillUnits('inhaler', 2), color: 'orange' },
] as const satisfies readonly {
  key: keyof typeof t.counts;
  units: PillUnitKind[];
  color: PillColor;
}[];

const UNIT_SIZE: Partial<Record<PillUnitKind, number>> = { drop: 28, puff: 32 };

function Swatches({ grey = false }: { grey?: boolean }) {
  return (
    <ul className={`${styles.swatches ?? ''} ${grey ? (styles.grey ?? '') : ''}`}>
      {PILL_COLORS.map((c) => (
        <li key={c} className={styles.swatch}>
          <Glyph name={`swatch-${c}`} size={54} />
          <span className={styles.swatchName}>{t.swatchNames[c]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Recreates the design's "Pill styles" board (design/source/Pills.dc.html). */
export function PillBoard() {
  return (
    <section className={styles.board} aria-labelledby="sg-pills">
      <div className={styles.head}>
        <h2 id="sg-pills" className={styles.title}>
          {t.title}
        </h2>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      <ul className={styles.forms}>
        {FORMS.map((f) => (
          <li key={f.key} className={styles.form}>
            <PillUnit kind={f.kind} color={f.color} color2={f.color2} score={f.score} size={124} />
            <span className={styles.formName}>{t.forms[f.key]}</span>
          </li>
        ))}
        <li className={styles.form}>
          {/* The board draws its inhaler in coral, which is not a pill colour: use that drawing. */}
          <Glyph name="form-inhaler" size={124} />
          <span className={styles.formName}>{t.forms.inhaler}</span>
        </li>
      </ul>

      <div className={styles.middle}>
        <div className={styles.howMany}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>{t.howMany.title}</h3>
            <span className={styles.sectionNote}>{t.howMany.note}</span>
          </div>
          <ul className={styles.counts}>
            {COUNTS.map((count) => (
              <li key={count.key} className={styles.count}>
                <span className={styles.countUnits} aria-hidden="true">
                  {count.units.map((kind, i) => (
                    <PillUnit
                      key={i}
                      kind={kind}
                      color={count.color}
                      score={kind === 'tablet'}
                      size={UNIT_SIZE[kind] ?? 64}
                    />
                  ))}
                </span>
                <span className={styles.countName}>{t.counts[count.key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.colors}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>{t.swatches.title}</h3>
            <span className={styles.sectionNote}>{t.swatches.note}</span>
          </div>
          <Swatches />
          <span className={styles.monoTitle}>{t.blackWhite}</span>
          <Swatches grey />
        </div>
      </div>

      <div className={styles.household}>
        <div className={styles.householdText}>
          <h3 className={styles.sectionTitle}>{t.household.title}</h3>
          <span className={styles.householdNote}>{t.household.note}</span>
        </div>
        <ul className={styles.marks}>
          {HOUSEHOLD_MARKS.map((mark) => (
            <li key={mark} className={styles.mark}>
              <HouseholdMark mark={mark} size={64} />
              <span className={styles.markName}>{copy.graphics.household[mark]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
