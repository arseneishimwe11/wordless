import { Fragment } from 'react';

import { copy } from '@/copy/en';
import {
  quantity,
  sheetFor,
  sheetNote,
  type CourseGrid,
  type Person,
  type ScheduleMeta,
  type ScheduledRow,
  type SheetRow,
  type Tally,
  type TimeOfDay,
  type WhenNeededRow,
} from '@/domain';
import { Glyph, PillStack, PillUnit } from '@/graphics';

import { RULE_GLYPH, TIME_GLYPH, timeColor } from '../flow';
import { DashedDose } from '../household/DashedDose';
import { columns, days, paginate, TABLE, TRACKS, type PlacedRow, type PlacedTrack } from './layout';
import { At, Footer, Legend, NameAndMark, tileRadius, TickRule, TimeHeaders } from './parts';
import { finishedSentence } from './sentence';
import { SheetPage } from './SheetPage';
import { StampArrow } from './StampArrow';
import styles from './FridgeSheet.module.css';

const t = copy.sheet;

/** The medicine, named for screen readers ("Amoxicillin 500 mg, capsule"). */
const pictureOf = (row: { medicine: SheetRow['medicine'] }) =>
  copy.screens.picture(row.medicine.name, copy.screens.forms[row.medicine.form]);

/** The card that starts each row: the medicine drawn large, its rules, its name. */
function MedicineCard({ row, place }: { row: SheetRow; place: PlacedRow }) {
  const { medicine } = row;
  const manyRules = medicine.rules.length > 1;
  const big = row.keyUnit === 'capsule' ? 92 : 74;
  // The design's own row heights; shorter rows draw the medicine a little smaller.
  const fullHeight = row.kind === 'scheduled' ? 150 : 120;
  return (
    <At
      left={TABLE.left}
      top={place.top}
      width={TABLE.cardWidth}
      height={place.height}
      className={styles.card}
    >
      <span className={styles.cardDrawing}>
        <PillUnit
          kind={row.keyUnit}
          color={medicine.color}
          color2={medicine.color2}
          score={medicine.score}
          size={manyRules || place.height < fullHeight ? Math.round(big * 0.8) : big}
          label={pictureOf(row)}
        />
        {medicine.rules.map((rule) => (
          <Glyph
            key={rule}
            name={RULE_GLYPH[rule]}
            size={manyRules ? 34 : 46}
            label={copy.screens.rules.names[rule]}
          />
        ))}
      </span>
      {medicine.name && <span className={styles.cardName}>{medicine.name}</span>}
    </At>
  );
}

/** A scheduled medicine: its dose drawn in each time it is taken. */
function ScheduledCells({ row, place }: { row: ScheduledRow; place: PlacedRow }) {
  const cols = columns(row.cells.length);
  const { medicine } = row;
  return (
    <>
      {row.cells.map((cell, i) => {
        const col = cols[i] ?? { left: 0, width: 0 };
        return (
          <At
            key={cell.time}
            left={col.left}
            top={place.top}
            width={col.width}
            height={place.height}
            className={styles.cell}
            style={{ background: timeColor(cell.time, 'wash'), borderRadius: tileRadius(i + 1) }}
          >
            {cell.dose && (
              <>
                <PillStack
                  form={medicine.form}
                  qty={medicine.qty}
                  color={medicine.color}
                  color2={medicine.color2}
                  score={medicine.score}
                  context="fridge"
                  label={t.dose(quantity(medicine, copy.domain), cell.withFood)}
                />
                {cell.withFood && <Glyph name="with-food" size={42} />}
              </>
            )}
          </At>
        );
      })}
    </>
  );
}

/** Only when needed: a dashed band across the day, with the most a day and a hand. */
function WhenNeededBand({
  row,
  place,
  times,
}: {
  row: WhenNeededRow;
  place: PlacedRow;
  times: readonly TimeOfDay[];
}) {
  const cols = columns(times.length);
  const { medicine } = row;
  const inset = place.height >= 120 ? 12 : 8;
  return (
    <>
      {cols.map((col, i) => (
        <At
          key={i}
          left={col.left}
          top={place.top}
          width={col.width}
          height={place.height}
          style={{
            background: timeColor(times[i] ?? 'sunrise', 'wash'),
            borderRadius: tileRadius(i + 1),
          }}
        />
      ))}
      <At
        left={TABLE.columnsLeft + 8}
        top={place.top + inset}
        width={TABLE.right - TABLE.columnsLeft - 16}
        height={place.height - inset * 2}
        className={styles.band}
      >
        <span className="visuallyHidden">
          {quantity(medicine, copy.domain)}. {t.atMost(row.maxPerDay)}
        </span>
        <span className={styles.bandDrawing} aria-hidden="true">
          <Glyph name="when-needed" size={60} />
          <span className={styles.doses}>
            {Array.from({ length: row.maxPerDay }, (_, i) => (
              <DashedDose key={i} medicine={medicine} unit={row.keyUnit} size={48} />
            ))}
          </span>
          <span className={styles.divider} />
          <Glyph name="no-more" size={50} />
          <Glyph name="fifth-crossed" size={46} />
        </span>
      </At>
    </>
  );
}

/** The boxes to tick: day numbers, then a band per dose time with a box per day. */
function GridTrack({
  track,
  row,
  place,
  note,
}: {
  track: CourseGrid;
  row: SheetRow;
  place: PlacedTrack;
  note: string | null;
}) {
  const { centers, box, number } = days(track.days.length);
  const bandsTop = place.top + TRACKS.numbersHeight;
  const bandsHeight =
    track.rows.length * TRACKS.bandHeight + (track.rows.length - 1) * TRACKS.bandGap;
  const middle = bandsTop + bandsHeight / 2;
  return (
    <div className={track.faded ? styles.faded : undefined}>
      {track.days.map((day, d) => (
        <At
          key={d}
          left={(centers[d] ?? 0) - number / 2}
          top={place.top}
          width={number}
          height={number}
          className={styles.dayNumber}
          style={{ borderRadius: tileRadius(d) }}
        >
          {day ?? '·'}
        </At>
      ))}
      <At left={64} top={bandsTop + Math.min(22, (bandsHeight - 74) / 2)} width={74} height={74}>
        <PillUnit
          kind={row.keyUnit}
          color={row.medicine.color}
          color2={row.medicine.color2}
          score={row.medicine.score}
          size={74}
          label={pictureOf(row)}
        />
      </At>
      {track.rows.map((band, r) => {
        const top = bandsTop + r * (TRACKS.bandHeight + TRACKS.bandGap);
        return (
          <Fragment key={band.time}>
            <At
              left={TRACKS.bandLeft}
              top={top}
              width={TRACKS.bandWidth}
              height={TRACKS.bandHeight}
              style={{ background: timeColor(band.time, 'wash'), borderRadius: tileRadius(r) }}
            />
            <At left={160} top={top + 3} width={40} height={40}>
              <Glyph
                name={TIME_GLYPH[band.time]}
                size={40}
                label={copy.graphics.glyphs[TIME_GLYPH[band.time]]}
              />
            </At>
            {centers.map((c, d) => (
              <At
                key={d}
                left={c - box / 2}
                top={top + (TRACKS.bandHeight - box) / 2}
                width={box}
                height={box}
                className={
                  band.box === 'dashed' ? `${styles.box ?? ''} ${styles.dashed ?? ''}` : styles.box
                }
                style={{ borderRadius: tileRadius(d) }}
              />
            ))}
          </Fragment>
        );
      })}
      {track.end === 'stamp' && (
        <>
          <StampArrow left={662} top={middle - 12} />
          <At left={676} top={middle - 38} width={76} height={76}>
            <Glyph name="course-done" size={76} label={t.allDone} />
          </At>
        </>
      )}
      {track.end === 'repeat' && (
        <At left={676} top={middle - 38} width={76} height={76}>
          <Glyph name="repeat" size={76} label={t.repeat} />
        </At>
      )}
      {note && (
        <At left={TRACKS.bandLeft} top={bandsTop + bandsHeight + 4} className={styles.note}>
          {note}
        </At>
      )}
    </div>
  );
}

/** Only when needed: a tally of dashed circles a day, up to the most allowed, then the hand. */
function TallyTrack({ track, row, place }: { track: Tally; row: SheetRow; place: PlacedTrack }) {
  const { centers } = days(track.days.length);
  const perRow = Math.ceil(track.perDay / 2);
  const rows = track.perDay > 1 ? 2 : 1;
  const size = track.perDay > 4 ? 13 : 17;
  const pitch = size + 5;
  return (
    <>
      <At
        left={TRACKS.bandLeft}
        top={place.top}
        width={TRACKS.bandWidth}
        height={TRACKS.tallyHeight}
        style={{ background: 'var(--color-sheet-tally)', borderRadius: tileRadius(1) }}
      />
      <At left={66} top={place.top + 2} width={54} height={54}>
        <PillUnit
          kind={row.keyUnit}
          color={row.medicine.color}
          color2={row.medicine.color2}
          score={row.medicine.score}
          size={54}
          label={pictureOf(row)}
        />
      </At>
      <At left={159} top={place.top + 7} width={42} height={42}>
        <Glyph name="when-needed" size={42} label={copy.graphics.glyphs['when-needed']} />
      </At>
      {centers.map((c, d) =>
        Array.from({ length: track.perDay }, (_, k) => {
          const col = k % perRow;
          const line = Math.floor(k / perRow);
          const left = c - (perRow * pitch - 5) / 2 + col * pitch;
          const top = place.top + (TRACKS.tallyHeight - (rows * pitch - 5)) / 2 + line * pitch;
          return (
            <At
              key={`${String(d)}-${String(k)}`}
              left={left}
              top={top}
              width={size}
              height={size}
              className={styles.circle}
            />
          );
        }),
      )}
      <At left={690} top={place.top + 2} width={54} height={54}>
        <Glyph name="no-more" size={54} label={t.atMost(track.perDay)} />
      </At>
    </>
  );
}

export interface FridgeSheetProps {
  person: Person;
  meta: ScheduleMeta;
  /** The printed date ("25 November 2026"). */
  date: string;
  mono?: boolean | undefined;
}

/** The fridge sheet (FridgeSheet.dc.html): one A4 page, or more for a long schedule. */
export function FridgeSheet({ person, meta, date, mono = false }: FridgeSheetProps) {
  const sheet = sheetFor(person);
  const notes = person.medicines.map((m) => sheetNote(m, copy.domain));
  const pages = paginate(
    sheet,
    sheet.tracks.map((track, i) => track.kind === 'grid' && notes[i] !== null),
  );
  const sentence = finishedSentence(person.medicines);

  return (
    <>
      {pages.map((page, p) => (
        <SheetPage
          key={p}
          mono={mono}
          label={pages.length > 1 ? t.pageLabel(p + 1, pages.length) : undefined}
        >
          <NameAndMark person={person} />
          {page.rows.length > 0 && <TimeHeaders times={sheet.columns} />}
          {page.rows.map((place) => {
            const row = sheet.rows[place.index];
            if (!row) return null;
            return (
              <Fragment key={row.medicine.id}>
                <MedicineCard row={row} place={place} />
                {row.kind === 'scheduled' ? (
                  <ScheduledCells row={row} place={place} />
                ) : (
                  <WhenNeededBand row={row} place={place} times={sheet.columns} />
                )}
              </Fragment>
            );
          })}
          {page.ruleTop !== null && <TickRule top={page.ruleTop} sentence={sentence} />}
          {page.tracks.map((place) => {
            const track = sheet.tracks[place.index];
            const row = sheet.rows[place.index];
            if (!track || !row) return null;
            return track.kind === 'grid' ? (
              <GridTrack
                key={track.medicineId + String(place.index)}
                track={track}
                row={row}
                place={place}
                note={notes[place.index] ?? null}
              />
            ) : (
              <TallyTrack
                key={track.medicineId + String(place.index)}
                track={track}
                row={row}
                place={place}
              />
            );
          })}
          <Legend />
          <Footer person={person} meta={meta} date={date} />
        </SheetPage>
      ))}
    </>
  );
}
