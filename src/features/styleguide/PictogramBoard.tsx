import { copy } from '@/copy/en';
import { Glyph, Illustration, type GlyphName } from '@/graphics';
import { sunriseGrid } from '@/graphics/generated/illustrations/sunrise-grid';

import styles from './PictogramBoard.module.css';

const p = copy.styleguide.pictograms;
const names = copy.graphics.glyphs;

const GROUPS = [
  {
    key: 'when',
    glyphs: ['sunrise', 'mid-morning', 'midday', 'afternoon', 'sunset', 'night', 'when-needed'],
  },
  {
    key: 'how',
    glyphs: [
      'with-food',
      'empty-stomach',
      'with-water',
      'no-alcohol',
      'sleepiness',
      'keep-cool',
      'shake-first',
    ],
  },
  {
    key: 'marks',
    glyphs: [
      'take-it',
      'taken',
      'if-needed',
      'no-more',
      'course-done',
      'patient',
      'tick-each-time',
    ],
  },
] as const satisfies readonly { key: keyof typeof p.groups; glyphs: readonly GlyphName[] }[];

const ALL_MARKS = GROUPS.flatMap((group) => group.glyphs);

/** Recreates the design's "Pictogram family" board (design/source/Pictograms.dc.html). */
export function PictogramBoard() {
  return (
    <section className={styles.board} aria-labelledby="sg-pictograms">
      <div className={styles.head}>
        <h2 id="sg-pictograms" className={styles.title}>
          {p.title}
        </h2>
        <p className={styles.lead}>{p.lead}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.construction}>
          <Illustration
            data={sunriseGrid}
            label={copy.graphics.sunriseGrid}
            className={styles.grid}
          />
          <ul className={styles.rules}>
            {p.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className={styles.demo}>
            <figure className={styles.demoItem}>
              <span className={styles.demoTile}>
                <Glyph name="demo-ink" size={96} />
              </span>
              <figcaption>{p.demo.ink}</figcaption>
            </figure>
            <span className={styles.operator} aria-hidden="true">
              +
            </span>
            <figure className={styles.demoItem}>
              <span className={styles.demoTile}>
                <Glyph name="demo-color" size={96} />
              </span>
              <figcaption>{p.demo.color}</figcaption>
            </figure>
            <span className={styles.operator} aria-hidden="true">
              =
            </span>
            <figure className={styles.demoItem}>
              <span className={styles.demoTile}>
                <Glyph name="sunrise" size={96} />
              </span>
              <figcaption>{p.demo.printed}</figcaption>
            </figure>
          </div>
        </div>

        <div className={styles.groups}>
          {GROUPS.map((group) => (
            <div key={group.key} className={styles.group}>
              <div className={styles.groupHead}>
                <h3 className={styles.groupTitle}>{p.groups[group.key].title}</h3>
                <span className={styles.groupNote}>{p.groups[group.key].note}</span>
              </div>
              <ul className={styles.marks}>
                {group.glyphs.map((name) => (
                  <li key={name} className={styles.mark}>
                    <Glyph name={name} size={88} />
                    <span className={styles.markName}>{names[name]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.strips}>
        <div className={styles.strip}>
          <span className={styles.stripLabel}>{p.atOneCm}</span>
          <span className={styles.stripMarks}>
            {ALL_MARKS.map((name) => (
              <Glyph key={name} name={name} size={38} label={names[name]} />
            ))}
          </span>
        </div>
        <div className={`${styles.strip ?? ''} ${styles.stripMono ?? ''}`}>
          <span className={styles.stripLabel}>{p.blackWhite}</span>
          {/* The same marks again, in grey: decorative, already named in the row above. */}
          <span className={`${styles.stripMarks ?? ''} ${styles.grey ?? ''}`}>
            {ALL_MARKS.map((name) => (
              <Glyph key={name} name={name} size={38} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
