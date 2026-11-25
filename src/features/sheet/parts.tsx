/**
 * Pieces shared by the fridge sheet and the daily strips: the name line and mark, the
 * time headers, the legend and the footer with the code. Coordinates are the design's.
 */
import type { CSSProperties, ReactNode } from 'react';

import { copy } from '@/copy/en';
import { cx } from '@/lib/cx';
import type { Person, ScheduleMeta, TimeOfDay } from '@/domain';
import { Glyph, HouseholdMark, Illustration } from '@/graphics';
import { sheetRuleBottom } from '@/graphics/generated/illustrations/sheet-rule-bottom';
import { sheetRuleTop } from '@/graphics/generated/illustrations/sheet-rule-top';

import { TIME_GLYPH, timeColor } from '../flow';
import { columns, FOOT, TABLE } from './layout';
import { ScheduleQr } from './ScheduleQr';
import styles from './parts.module.css';

const t = copy.sheet;

/** Absolutely placed on the page, at the design's coordinates. */
export function At({
  left,
  top,
  width,
  height,
  className,
  style,
  children,
}: {
  left: number;
  top: number;
  width?: number | undefined;
  height?: number | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode;
}) {
  return (
    <div className={cx(styles.at, className)} style={{ left, top, width, height, ...style }}>
      {children}
    </div>
  );
}

/** "name — write by hand" and the person's mark, top left. */
export function NameAndMark({ person }: { person: Person }) {
  return (
    <>
      <At left={40} top={60} width={46} height={46}>
        <Glyph name="patient" size={46} label={t.patient} />
      </At>
      <At left={94} top={72} width={128} height={30} className={styles.nameLine} />
      <At left={94} top={106} className={styles.small}>
        {t.nameLine}
      </At>
      <At left={40} top={136} className={styles.markRow}>
        <HouseholdMark mark={person.mark} size={44} label={t.mark(person.mark)} />
        <span className={styles.small}>{t.sameMark}</span>
      </At>
    </>
  );
}

/** The time of day across the top, one tinted tile per column. */
export function TimeHeaders({ times }: { times: readonly TimeOfDay[] }) {
  return (
    <>
      {columns(times.length).map((col, i) => {
        const time = times[i] ?? 'sunrise';
        return (
          <At
            key={time}
            left={col.left}
            top={TABLE.headTop}
            width={col.width}
            height={TABLE.headHeight}
            className={styles.tile}
            style={{ background: timeColor(time, 'tint'), borderRadius: tileRadius(i) }}
          >
            <Glyph
              name={TIME_GLYPH[time]}
              size={88}
              label={copy.graphics.glyphs[TIME_GLYPH[time]]}
            />
          </At>
        );
      })}
    </>
  );
}

/** The sheet's bigger tiles use the sheet family of hand-drawn corners. */
export const tileRadius = (i: number): string => `var(--radius-sheet-${String((i % 4) + 1)})`;

/** The ruled line above the tracks, and "Tick one box each time". */
export function TickRule({ top, sentence }: { top: number; sentence: string }) {
  return (
    <>
      <At left={36} top={top} className={styles.rule}>
        <Illustration data={sheetRuleTop} width={722} />
      </At>
      <At left={40} top={top + 18} width={44} height={44}>
        <Glyph name="tick-each-time" size={44} />
      </At>
      <At left={94} top={top + 24} width={520} className={styles.tickText}>
        <strong>{t.tickTitle}</strong> {sentence}
      </At>
    </>
  );
}

const LEGEND = [
  ['taken', t.legend.take],
  ['if-needed', t.legend.ifNeeded],
  ['no-more', t.legend.noMore],
  ['course-done', t.legend.finished],
] as const;

/** What each mark on the sheet means. */
export function Legend() {
  return (
    <At left={40} top={FOOT.legendTop} width={714} className={styles.legend}>
      {LEGEND.map(([glyph, words]) => (
        <span key={glyph} className={styles.legendItem}>
          <Glyph name={glyph} size={40} />
          <span className={styles.legendWords}>{words}</span>
        </span>
      ))}
    </At>
  );
}

/** "Prepared by … · 25 November 2026", with a line to write on when no name is set. */
export function PreparedBy({
  meta,
  date,
  inline = false,
}: {
  meta: ScheduleMeta;
  date: string;
  /** Inside a sentence: "… · prepared by …". */
  inline?: boolean;
}) {
  return (
    <span>
      {inline ? t.preparedByInline : t.preparedBy}{' '}
      {meta.preparedBy ? meta.preparedBy : <span className={styles.writeIn} aria-hidden="true" />}
      {' · '}
      {date}
    </span>
  );
}

/** The cut rule, the code, what it is for, who prepared the sheet, and the wordmark. */
export function Footer({
  person,
  meta,
  date,
}: {
  person: Person;
  meta: ScheduleMeta;
  date: string;
}) {
  return (
    <>
      <At left={36} top={FOOT.ruleTop} className={styles.rule}>
        <Illustration data={sheetRuleBottom} width={722} />
      </At>
      <At left={40} top={FOOT.footerTop} className={styles.qrFrame}>
        <ScheduleQr person={person} meta={meta} />
      </At>
      <At left={176} top={962} width={360} className={styles.reload}>
        <strong className={styles.reloadTitle}>{t.reloadTitle}</strong>
        <span>{t.reloadBody}</span>
        <PreparedBy meta={meta} date={date} />
      </At>
      <div className={styles.wordmark}>
        <Glyph name="sunrise" size={30} />
        <span className={styles.wordmarkText}>{copy.app.name.toLowerCase()}</span>
      </div>
    </>
  );
}
