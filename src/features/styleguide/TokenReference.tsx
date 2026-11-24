import { useState } from 'react';

import { copy } from '@/copy/en';
import { AA_MINIMUM, contrastRatio } from '@/styles/contrast';
import { color, duration, ease, radius, shadow, space, stroke, textPairs } from '@/styles/tokens';

import { tokenVar, type StyleWithVars } from './cssVars';
import styles from './TokenReference.module.css';

const t = copy.styleguide.tokens;

/** Each shared keyframe with the duration and easing it is used with. */
const MOTIONS = [
  { name: 'wl-drop', duration: 'drop', ease: 'drop' },
  { name: 'wl-drop-unit', duration: 'drop-unit', ease: 'drop' },
  { name: 'wl-pop', duration: 'pop', ease: 'standard' },
  { name: 'wl-stamp', duration: 'stamp', ease: 'stamp' },
  { name: 'wl-nudge', duration: 'nudge', ease: 'standard' },
  { name: 'wl-fade', duration: 'fade', ease: 'standard' },
] as const satisfies readonly {
  name: string;
  duration: keyof typeof duration;
  ease: keyof typeof ease;
}[];

const ratioText = (n: number) => `${n.toFixed(2)} : 1`;

/**
 * How a component would use each shadow token. Geometry-only tokens get the colour a
 * component adds (a time-of-day ink or tint); complete tokens are used as they are.
 */
function shadowSample(key: string): string {
  const token = tokenVar('shadow', key);
  if (key.startsWith('dose-offset')) return `${token} var(--color-midday)`;
  if (key === 'ring-stop-halo')
    return `${token} var(--color-sunrise-tint), var(--shadow-ring-stop-edge)`;
  if (key === 'ring-stop-halo-lg') {
    return `${token} var(--color-sunrise-tint), var(--shadow-ring-stop-edge-lg)`;
  }
  return token;
}

export function TokenReference() {
  const [run, setRun] = useState(0);

  return (
    <div className={styles.reference}>
      <div className={styles.head}>
        <h2 id="sg-tokens" className={styles.title}>
          {t.title}
        </h2>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      <section aria-labelledby="sg-space" className={styles.group}>
        <h3 id="sg-space" className={styles.groupTitle}>
          {t.groups.space}
        </h3>
        <ul className={styles.list}>
          {Object.keys(space).map((key) => (
            <li key={key} className={styles.row}>
              <code className={styles.name}>--space-{key}</code>
              <span
                className={styles.spaceBar}
                style={{ '--bar': tokenVar('space', key) } as StyleWithVars}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-stroke" className={styles.group}>
        <h3 id="sg-stroke" className={styles.groupTitle}>
          {t.groups.stroke}
        </h3>
        <ul className={styles.list}>
          {Object.entries(stroke).map(([key, value]) => (
            <li key={key} className={styles.row}>
              <code className={styles.name}>--stroke-{key}</code>
              <span className={styles.value}>{value}</span>
              <span
                className={styles.strokeLine}
                style={{ '--line': tokenVar('stroke', key) } as StyleWithVars}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-radius" className={styles.group}>
        <h3 id="sg-radius" className={styles.groupTitle}>
          {t.groups.radius}
        </h3>
        <ul className={styles.tiles}>
          {Object.keys(radius).map((key) => (
            <li key={key} className={styles.tile}>
              <span
                className={styles.radiusSample}
                style={{ '--shape': tokenVar('radius', key) } as StyleWithVars}
                aria-hidden="true"
              />
              <code className={styles.name}>{key}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-shadow" className={styles.group}>
        <h3 id="sg-shadow" className={styles.groupTitle}>
          {t.groups.shadow}
        </h3>
        <ul className={styles.tiles}>
          {Object.keys(shadow).map((key) => (
            <li key={key} className={styles.tile}>
              <span
                className={styles.shadowSample}
                style={{ '--sample-shadow': shadowSample(key) } as StyleWithVars}
                aria-hidden="true"
              />
              <code className={styles.name}>{key}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-motion" className={styles.group}>
        <div className={styles.groupHead}>
          <h3 id="sg-motion" className={styles.groupTitle}>
            {t.groups.motion}
          </h3>
          <button
            type="button"
            className={styles.replay}
            onClick={() => {
              setRun((n) => n + 1);
            }}
          >
            {t.replay}
          </button>
        </div>
        <ul className={styles.tiles}>
          {MOTIONS.map((m) => (
            <li key={m.name} className={styles.tile}>
              <span className={styles.motionStage} aria-hidden="true">
                <span
                  // A new key re-mounts the element, which replays its animation.
                  key={run}
                  className={styles.motionSample}
                  style={
                    {
                      '--motion-name': m.name,
                      '--motion-duration': tokenVar('duration', m.duration),
                      '--motion-ease': tokenVar('ease', m.ease),
                    } as StyleWithVars
                  }
                />
              </span>
              <code className={styles.name}>{m.name}</code>
              <span className={styles.value}>
                {duration[m.duration]} · {ease[m.ease]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-contrast" className={styles.group}>
        <h3 id="sg-contrast" className={styles.groupTitle}>
          {t.groups.contrast}
        </h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.caption}>{t.contrastCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.contrastColumns.sample}</th>
                <th scope="col">{t.contrastColumns.pair}</th>
                <th scope="col">{t.contrastColumns.where}</th>
                <th scope="col">{t.contrastColumns.ratio}</th>
                <th scope="col">{t.contrastColumns.result}</th>
              </tr>
            </thead>
            <tbody>
              {textPairs.map((pair) => {
                const ratio = contrastRatio(color[pair.fg], color[pair.bg]);
                const pass = ratio >= AA_MINIMUM[pair.size];
                return (
                  <tr key={`${pair.fg}/${pair.bg}`}>
                    <td>
                      <span
                        className={styles.contrastSample}
                        style={
                          {
                            '--fg': tokenVar('color', pair.fg),
                            '--bg': tokenVar('color', pair.bg),
                          } as StyleWithVars
                        }
                        aria-hidden="true"
                      >
                        {t.sampleText}
                      </span>
                    </td>
                    <td>
                      <code>{pair.fg}</code> / <code>{pair.bg}</code>
                    </td>
                    <td>{pair.where}</td>
                    <td className={styles.ratio}>{ratioText(ratio)}</td>
                    <td>
                      {pass ? t.pass : t.fail}
                      {pair.size === 'large' ? ` (${t.largeOnly})` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
