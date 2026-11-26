import { Fragment } from 'react';

import { copy } from '@/copy/en';
import {
  keyUnit,
  quantity,
  scheduledDoses,
  sheetFor,
  type Medicine,
  type Person,
  type ScheduleMeta,
} from '@/domain';
import { Glyph, HouseholdMark, Icon, PillStack, PillUnit } from '@/graphics';
import { cx } from '@/lib/cx';

import { cellRadius, TIME_GLYPH, timeColor } from '../flow';
import { At, PreparedBy } from './parts';
import { SheetPage } from './SheetPage';
import { activeOn, isScheduled, STRIPS_PER_PAGE, stripDays } from './strips';
import styles from './DailyStrips.module.css';

const t = copy.sheet;

const STRIP = { left: 40, top: 40, width: 714, height: 132, pitch: 146 } as const;

/** One day: its number and mark, a column per time with a box to tick, and "when needed". */
function Strip({ person, day }: { person: Person; day: number }) {
  const sheet = sheetFor(person);
  const today = person.medicines.filter((m) => activeOn(m, day));
  const scheduled = today.filter(isScheduled);
  const whenNeeded = today.filter((m) => m.timing.mode === 'whenNeeded');
  const doseTimes = new Set(scheduled.flatMap((m) => scheduledDoses(m.timing)));
  const many = scheduled.length > 1;

  return (
    <div className={cx(styles.strip, whenNeeded.length === 0 && styles.noPanel)}>
      <div className={styles.day}>
        <span className={styles.dayNumber} style={{ borderRadius: cellRadius(day - 1) }}>
          <span className="visuallyHidden">{t.strips.day(day)}</span>
          <span aria-hidden="true">{day}</span>
        </span>
        <HouseholdMark mark={person.mark} size={28} label={t.mark(person.mark)} />
      </div>
      {sheet.columns.map((time, i) => {
        const doses = scheduled.filter((m) => scheduledDoses(m.timing).includes(time));
        return (
          <div
            key={time}
            className={cx(styles.time, doseTimes.has(time) ? styles.doseTime : styles.quietTime)}
            style={{ background: timeColor(time, 'wash'), borderRadius: cellRadius(i + day - 1) }}
          >
            <Glyph
              name={TIME_GLYPH[time]}
              size={many ? 26 : 34}
              label={copy.graphics.glyphs[TIME_GLYPH[time]]}
            />
            {doses.map((m) => (
              <DoseLine key={m.id} medicine={m} small={many} radius={cellRadius(i + day - 1)} />
            ))}
          </div>
        );
      })}
      {whenNeeded.length > 0 && (
        <div className={styles.panel}>
          {whenNeeded.map((m) => (
            <WhenNeededLine key={m.id} medicine={m} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A dose at one time: drawn, the food mark, and its box. */
function DoseLine({
  medicine,
  small,
  radius,
}: {
  medicine: Medicine;
  small: boolean;
  radius: string;
}) {
  const food = medicine.rules.includes('withFood');
  return (
    <span className={styles.dose}>
      <PillStack
        form={medicine.form}
        qty={medicine.qty}
        color={medicine.color}
        color2={medicine.color2}
        score={medicine.score}
        context="strip"
        label={t.dose(quantity(medicine, copy.domain), food)}
        className={small ? styles.smallDose : undefined}
      />
      {food && <Glyph name="with-food" size={small ? 18 : 24} />}
      <span className={styles.tick} style={{ borderRadius: radius }} />
    </span>
  );
}

/** Only when needed: the dose, the hand, and a circle for each one allowed. */
function WhenNeededLine({ medicine }: { medicine: Medicine }) {
  const max = medicine.timing.maxPerDay;
  return (
    <span className={styles.whenNeeded}>
      <span className={styles.whenNeededHead}>
        <Glyph name="when-needed" size={34} label={copy.graphics.glyphs['when-needed']} />
        <PillUnit
          kind={keyUnit(medicine)}
          color={medicine.color}
          color2={medicine.color2}
          score={medicine.score}
          size={32}
          label={copy.screens.picture(medicine.name, copy.screens.forms[medicine.form])}
        />
        <Glyph name="no-more" size={30} label={t.atMost(max)} />
      </span>
      <span className={styles.circles} aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={styles.circle} />
        ))}
      </span>
    </span>
  );
}

export interface DailyStripsProps {
  person: Person;
  meta: ScheduleMeta;
  date: string;
  mono?: boolean | undefined;
}

/** Tear-off strips, seven to a page (DailyStrip.dc.html). */
export function DailyStrips({ person, meta, date, mono = false }: DailyStripsProps) {
  const total = stripDays(person.medicines);
  const pages = Math.ceil(total / STRIPS_PER_PAGE);
  const names = person.medicines.map((m) => m.name).filter(Boolean);

  return (
    <>
      {Array.from({ length: pages }, (_, p) => {
        const first = p * STRIPS_PER_PAGE + 1;
        const count = Math.min(STRIPS_PER_PAGE, total - first + 1);
        return (
          <SheetPage
            key={p}
            kind="strips"
            mono={mono}
            label={pages > 1 ? t.pageLabel(p + 1, pages) : undefined}
          >
            {Array.from({ length: count }, (_, i) => {
              const top = STRIP.top + i * STRIP.pitch;
              return (
                <Fragment key={i}>
                  <At left={STRIP.left} top={top} width={STRIP.width} height={STRIP.height}>
                    <Strip person={person} day={first + i} />
                  </At>
                  {i < count - 1 && (
                    <>
                      <At left={40} top={top + 129} className={styles.scissors}>
                        <Icon name="scissors" />
                      </At>
                      <At left={72} top={top + 139} width={682} className={styles.cut} />
                    </>
                  )}
                </Fragment>
              );
            })}
            <At left={40} top={1056} width={714} className={styles.footer}>
              <strong>{t.strips.cutTitle}</strong> {t.strips.cutBody}{' '}
              {names.length > 0 && `${names.join(' · ')} · `}
              <PreparedBy meta={meta} date={date} inline />
            </At>
          </SheetPage>
        );
      })}
    </>
  );
}
