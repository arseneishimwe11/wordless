import { copy } from '@/copy/en';
import { color, greyEquivalent } from '@/styles/tokens';

import styles from './ColorTypeBoard.module.css';
import { tokenVar, type StyleWithVars } from './cssVars';
import { IllustrationSlot } from './IllustrationSlot';

const board = copy.styleguide.board;

const TIMES = ['sunrise', 'midday', 'sunset', 'night'] as const;
const PAPER = ['paper', 'paper-deep', 'rule', 'ink', 'ink-soft', 'pen'] as const;

/** The design's hand-cut swatch shapes, rotated through the paper & ink grid. */
const SWATCH_SHAPES = ['swatch-1', 'swatch-2', 'swatch-3'] as const;

/**
 * Recreates the design's "Design system — color & type" board (design/source/Main.dc.html)
 * using only tokens.
 */
export function ColorTypeBoard() {
  return (
    <div className={styles.board}>
      <section className={styles.hero} aria-labelledby="sg-wordmark">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>{board.eyebrow}</p>
          <div className={styles.wordmarkRow}>
            <IllustrationSlot label={board.logoLabel} width={112} height={112} />
            <h1 id="sg-wordmark" className={styles.wordmark}>
              {board.wordmark}
            </h1>
          </div>
          <p className={styles.tagline}>{board.tagline}</p>
          <p className={styles.lead}>{board.lead}</p>
        </div>
        <IllustrationSlot label={board.boxLabel} width={520} height={340} />
      </section>

      <section className={styles.time} aria-labelledby="sg-time">
        <div className={styles.timeHead}>
          <h2 id="sg-time" className={styles.timeTitle}>
            {board.timeTitle}
          </h2>
          <p className={styles.timeLead}>{board.timeLead}</p>
        </div>
        <IllustrationSlot label={board.sunPathLabel} width={1264} height={330} />
        <ul className={styles.timeGrid}>
          {TIMES.map((time) => {
            const t = board.times[time];
            const grey = greyEquivalent[time];
            const chip: StyleWithVars = { '--chip-color': grey.swatch };
            return (
              <li key={time} className={styles.timeItem}>
                <div className={styles.timeName}>
                  <IllustrationSlot label={t.name} width={48} height={48} />
                  <div className={styles.timeNameText}>
                    <span className={styles.timeHeading}>{t.name}</span>
                    <span className={styles.timeWhen}>{t.when}</span>
                  </div>
                </div>
                <p className={styles.timeInks}>
                  <span>
                    <strong>{t.ink}</strong> {color[time]}
                  </span>
                  <span>
                    {board.tint} {color[`${time}-tint`]}
                  </span>
                </p>
                <p className={styles.timeGrey}>
                  <span className={styles.greyChip} style={chip} aria-hidden="true" />
                  {board.blackWhite} {grey.ink} {board.inkSuffix}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.split}>
        <section className={styles.paper} aria-labelledby="sg-paper">
          <h2 id="sg-paper" className={styles.sectionTitle}>
            {board.paperTitle}
          </h2>
          <ul className={styles.paperGrid}>
            {PAPER.map((key, i) => {
              const swatch: StyleWithVars = {
                '--swatch-color': tokenVar('color', key),
                '--swatch-shape': tokenVar('radius', SWATCH_SHAPES[i % SWATCH_SHAPES.length] ?? ''),
              };
              return (
                <li key={key} className={styles.paperItem}>
                  <span className={styles.swatch} style={swatch} aria-hidden="true" />
                  <span className={styles.paperText}>
                    <span className={styles.paperName}>
                      {board.paper[key].name} <span className={styles.hex}>{color[key]}</span>
                    </span>
                    <span className={styles.paperNote}>{board.paper[key].note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.type} aria-labelledby="sg-type">
          <h2 id="sg-type" className={styles.sectionTitle}>
            {board.typeTitle}
          </h2>
          <div className={styles.specimen}>
            <p className={styles.specimenDisplay}>{board.type.display.sample}</p>
            <p className={styles.caption}>
              <strong>{board.type.display.family}</strong>
              {board.type.display.note}
            </p>
          </div>
          <div className={styles.specimen}>
            <p className={styles.specimenBody}>
              <strong>{board.type.body.sampleStrong}</strong>
              {board.type.body.sample}
            </p>
            <p className={styles.caption}>
              <strong>{board.type.body.family}</strong>
              {board.type.body.note}
            </p>
          </div>
          <div className={styles.specimen}>
            <p className={styles.specimenHand}>{board.type.hand.sample}</p>
            <p className={styles.caption}>
              <strong>{board.type.hand.family}</strong>
              {board.type.hand.note}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
