import type { CSSProperties } from 'react';

import { copy } from '@/copy/en';
import { quantity, rulesText, sheetFor, type Person, type SheetRow } from '@/domain';
import { Glyph, PillStack, PillUnit } from '@/graphics';

import { cellRadius, TIME_GLYPH, timeColor } from '../flow';
import { DashedDose } from './DashedDose';
import styles from './TodayGrid.module.css';

const c = copy.domain;

/** The medicine as it starts its row: its own drawing, named for screen readers. */
function RowHeader({ row }: { row: SheetRow }) {
  const { medicine } = row;
  return (
    <span role="rowheader" className={styles.rowHeader}>
      <PillUnit
        kind={row.keyUnit}
        color={medicine.color}
        color2={medicine.color2}
        score={medicine.score}
        size={row.keyUnit === 'capsule' ? 46 : 40}
        label={copy.screens.picture(medicine.name, copy.screens.forms[medicine.form])}
      />
    </span>
  );
}

/**
 * "Today, for Grandmother": one day of the sheet in small. Times across the top,
 * one row per medicine. A table for screen readers; tiles for the eye.
 */
export function TodayGrid({ person, label }: { person: Person; label: string }) {
  // The same columns and rows as the printed sheet.
  const { columns, rows } = sheetFor(person);
  const style = { '--columns': String(columns.length) } as CSSProperties;
  return (
    <div role="table" aria-label={label} className={styles.card}>
      <div className={styles.grid} style={style}>
        <div role="row" className={styles.row}>
          <span role="columnheader" className={styles.corner}>
            <span className="visuallyHidden">{copy.screens.household.medicineColumn}</span>
          </span>
          {columns.map((time, i) => (
            <span
              key={time}
              role="columnheader"
              className={styles.head}
              style={{ background: timeColor(time, 'tint'), borderRadius: cellRadius(i) }}
            >
              <Glyph
                name={TIME_GLYPH[time]}
                size={40}
                label={copy.graphics.glyphs[TIME_GLYPH[time]]}
              />
            </span>
          ))}
        </div>
        {rows.map((row) => {
          const { medicine } = row;
          const dose = `${quantity(medicine, c)}${medicine.rules.length ? `, ${rulesText(medicine.rules, c)}` : ''}`;
          if (row.kind === 'whenNeeded') {
            return (
              <div role="row" key={medicine.id} className={styles.row}>
                <RowHeader row={row} />
                <span role="cell" className={styles.band}>
                  <span className="visuallyHidden">
                    {dose}. {copy.screens.household.upTo(row.maxPerDay)}
                  </span>
                  <span className={styles.bandDrawing} aria-hidden="true">
                    <Glyph name="when-needed" size={40} />
                    {Array.from({ length: row.maxPerDay }, (_, i) => (
                      <DashedDose key={i} medicine={medicine} unit={row.keyUnit} />
                    ))}
                    <Glyph name="no-more" size={34} />
                  </span>
                </span>
              </div>
            );
          }
          return (
            <div role="row" key={medicine.id} className={styles.row}>
              <RowHeader row={row} />
              {row.cells.map((cell, i) => (
                <span
                  key={cell.time}
                  role="cell"
                  className={styles.cell}
                  style={{
                    background: timeColor(cell.time, 'wash'),
                    borderRadius: cellRadius(i + 1),
                  }}
                >
                  {cell.dose && (
                    <>
                      <span className="visuallyHidden">{dose}</span>
                      <PillStack
                        form={medicine.form}
                        qty={medicine.qty}
                        color={medicine.color}
                        color2={medicine.color2}
                        score={medicine.score}
                        context="today"
                      />
                      {cell.withFood && <Glyph name="with-food" size={26} />}
                    </>
                  )}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
