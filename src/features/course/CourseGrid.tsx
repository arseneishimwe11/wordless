import { Animated, HandNote } from '@/components';
import { copy } from '@/copy/en';
import { sheetFor, type CourseTrack, type Medicine } from '@/domain';
import { Glyph } from '@/graphics';
import { cx } from '@/lib/cx';

import { TIME_GLYPH } from '../flow';
import styles from './CourseGrid.module.css';

const WEEK = 7;

const BOX_SHAPES = ['var(--radius-box-1)', 'var(--radius-box-2)', 'var(--radius-box-3)'];

const weeksOf = <T,>(days: readonly T[]): T[][] =>
  Array.from({ length: Math.ceil(days.length / WEEK) }, (_, w) =>
    days.slice(w * WEEK, w * WEEK + WEEK),
  );

export interface CourseGridProps {
  medicine: Medicine;
  /** The handwritten note under the grid. */
  note: string;
  /** Draws the note in the error colour (Next was pressed with no length). */
  error: boolean;
}

/**
 * The boxes the sheet will show, a column per day and a row per dose, grouped by
 * week. Dotted while the length is missing; done when the boxes are done.
 */
export function CourseGrid({ medicine, note, error }: CourseGridProps) {
  const track: CourseTrack | undefined = sheetFor({ medicines: [medicine] }).tracks[0];
  if (!track) return null;
  const replay = `${String(track.days.length)}-${String(track.days[0])}-${medicine.course.unit}`;

  return (
    <div className={styles.card}>
      <div aria-hidden="true" className={styles.weeks}>
        {weeksOf(track.days).map((week, w) => (
          <div
            key={w}
            className={cx(styles.week, track.kind === 'grid' && track.faded && styles.faded)}
          >
            <div className={styles.times}>
              {track.kind === 'grid' ? (
                track.rows.map((row) => (
                  <span key={row.time} className={styles.timeRow}>
                    <Glyph name={TIME_GLYPH[row.time]} size={26} />
                  </span>
                ))
              ) : (
                <span className={styles.timeRow}>
                  <Glyph name="when-needed" size={26} />
                </span>
              )}
            </div>
            {week.map((day, d) => {
              const i = w * WEEK + d;
              return (
                <Animated
                  key={`${replay}-${String(i)}`}
                  effect="pop"
                  delay={track.kind === 'grid' && track.faded ? 0 : Math.min(i * 45, 600)}
                  className={styles.dayCell}
                >
                  <span className={styles.day}>
                    <span className={styles.dayNumber}>{day ?? '·'}</span>
                    {track.kind === 'grid' ? (
                      track.rows.map((row, r) => (
                        <span
                          key={row.time}
                          className={cx(styles.box, row.box === 'dashed' && styles.dashed)}
                          style={{ borderRadius: BOX_SHAPES[r % BOX_SHAPES.length] }}
                        />
                      ))
                    ) : (
                      <span className={styles.tally}>
                        {Array.from({ length: track.perDay }, (_, k) => (
                          <span key={k} className={styles.circle} />
                        ))}
                      </span>
                    )}
                  </span>
                </Animated>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.foot}>
        {track.end === 'stamp' && (
          <Animated effect="stamp" delay={500} replay={replay}>
            <Glyph name="course-done" size={48} label={copy.screens.howLong.finished} />
          </Animated>
        )}
        {track.end === 'repeat' && <Glyph name="repeat" size={44} />}
        <HandNote
          as="span"
          aria-live="polite"
          tone={error ? 'error' : 'pen'}
          className={styles.note}
        >
          {note}
        </HandNote>
      </div>
    </div>
  );
}
