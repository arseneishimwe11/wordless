import { copy } from '@/copy/en';
import { Glyph, Icon, Illustration, type GlyphName, type IconName } from '@/graphics';
import { icons } from '@/graphics/generated/icons';
import { builderWell } from '@/graphics/generated/illustrations/builder-well';
import { builderWellDesktop } from '@/graphics/generated/illustrations/builder-well-desktop';
import { hintArrow } from '@/graphics/generated/illustrations/hint-arrow';
import { logo } from '@/graphics/generated/illustrations/logo';
import { medicineBox } from '@/graphics/generated/illustrations/medicine-box';
import { sheetRuleBottom } from '@/graphics/generated/illustrations/sheet-rule-bottom';
import { sheetRuleTop } from '@/graphics/generated/illustrations/sheet-rule-top';
import { startSky } from '@/graphics/generated/illustrations/start-sky';
import { sunArcBands } from '@/graphics/generated/illustrations/sun-arc-bands';
import { sunArcDesktop } from '@/graphics/generated/illustrations/sun-arc-desktop';
import { sunArcDesktopPrn } from '@/graphics/generated/illustrations/sun-arc-desktop-prn';
import { sunArcGround } from '@/graphics/generated/illustrations/sun-arc-ground';
import { sunArcPrn } from '@/graphics/generated/illustrations/sun-arc-prn';
import { sunPath } from '@/graphics/generated/illustrations/sun-path';
import { sunRays } from '@/graphics/generated/illustrations/sun-rays';
import { sunriseGrid } from '@/graphics/generated/illustrations/sunrise-grid';
import type { GraphicData } from '@/graphics/types';

import styles from './GraphicsIndex.module.css';

const t = copy.styleguide.graphicsIndex;

/** Glyphs that the Pictograms and Pills boards don't show. */
const OTHER_GLYPHS: readonly GlyphName[] = [
  'form-tablet',
  'form-oval',
  'form-capsule',
  'form-liquid',
  'form-drops',
  'form-inhaler',
  'dose-if-needed-tablet',
  'dose-if-needed-capsule',
  'fifth-crossed',
  'repeat',
  'sun-small',
  'moon',
  'stamp-as-prescribed',
  'landing-stopped-early',
  'landing-any-language',
  'landing-offline',
];

const ILLUSTRATIONS: readonly (readonly [string, GraphicData])[] = [
  ['logo', logo],
  ['medicine-box', medicineBox],
  ['sun-path', sunPath],
  ['sunrise-grid', sunriseGrid],
  ['start-sky', startSky],
  ['builder-well', builderWell],
  ['builder-well-desktop', builderWellDesktop],
  ['sun-arc-ground', sunArcGround],
  ['sun-arc-bands', sunArcBands],
  ['sun-arc-prn', sunArcPrn],
  ['sun-arc-desktop', sunArcDesktop],
  ['sun-arc-desktop-prn', sunArcDesktopPrn],
  ['sun-rays', sunRays],
  ['hint-arrow', hintArrow],
  ['sheet-rule-top', sheetRuleTop],
  ['sheet-rule-bottom', sheetRuleBottom],
];

/** Every other extracted drawing, by name, so each can be reviewed before a screen uses it. */
export function GraphicsIndex() {
  return (
    <section className={styles.index} aria-labelledby="sg-graphics">
      <div className={styles.head}>
        <h2 id="sg-graphics" className={styles.title}>
          {t.title}
        </h2>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      <h3 className={styles.groupTitle}>{t.icons}</h3>
      <ul className={styles.grid}>
        {(Object.keys(icons) as IconName[]).map((name) => (
          <li key={name} className={styles.item}>
            <span className={styles.iconTile}>
              <Icon name={name} />
            </span>
            <code className={styles.name}>{name}</code>
          </li>
        ))}
      </ul>

      <h3 className={styles.groupTitle}>{t.glyphs}</h3>
      <ul className={styles.grid}>
        {OTHER_GLYPHS.map((name) => (
          <li key={name} className={styles.item}>
            <Glyph name={name} size={64} />
            <code className={styles.name}>{name}</code>
          </li>
        ))}
      </ul>

      <h3 className={styles.groupTitle}>{t.illustrations}</h3>
      <ul className={styles.illustrations}>
        {ILLUSTRATIONS.map(([name, data]) => (
          <li key={name} className={styles.illustration}>
            <span className={styles.illustrationTile}>
              <Illustration data={data} className={styles.illustrationArt} />
            </span>
            <code className={styles.name}>{name}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
