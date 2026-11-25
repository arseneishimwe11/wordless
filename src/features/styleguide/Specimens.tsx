import type { ReactNode } from 'react';

import {
  Button,
  ChoiceGroup,
  Kbd,
  OptionGroup,
  SegmentedControl,
  StepRail,
  StepRailItem,
  Stepper,
  Summary,
  Swatch,
  TextField,
  ToggleCard,
} from '@/components';
import { copy } from '@/copy/en';
import { Glyph, PILL_COLORS, type GlyphName } from '@/graphics';

import styles from './Specimens.module.css';

const t = copy.styleguide.components;
const s = t.sample;

const FORMS = [
  ['tablet', 'form-tablet', 3],
  ['oval', 'form-oval', 2],
  ['capsule', 'form-capsule', 1],
  ['liquid', 'form-liquid', 3],
  ['drops', 'form-drops', 2],
  ['inhaler', 'form-inhaler', 1],
] as const satisfies readonly (readonly [keyof typeof s.forms, GlyphName, 1 | 2 | 3])[];

const RULES = [
  ['food', 'with-food', 3],
  ['nofood', 'empty-stomach', 2],
  ['water', 'with-water', 1],
  ['noalc', 'no-alcohol', 3],
  ['sleepy', 'sleepiness', 2],
  ['cool', 'keep-cool', 1],
  ['shake', 'shake-first', 3],
] as const satisfies readonly (readonly [keyof typeof s.rules, GlyphName, 1 | 2 | 3])[];

const noop = () => undefined;

/** A fixed-size frame, named for the board and region it reproduces. */
function Frame({
  name,
  width,
  height,
  children,
}: {
  name: string;
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <figure className={styles.specimen}>
      <div className={styles.frame} style={{ width, height }} data-specimen={name}>
        {children}
      </div>
      <figcaption className={styles.caption}>{name}</figcaption>
    </figure>
  );
}

/**
 * Regions of the design boards rebuilt from the primitives at their exact positions,
 * for side-by-side comparison with design/reference (positions measured on the boards).
 */
export function Specimens() {
  return (
    <section className={styles.specimens} aria-label={t.groups.specimens}>
      <h3 className={styles.title}>{t.groups.specimens}</h3>
      <div className={styles.grid}>
        {/* SunArc.dc.html in its default (empty) state, y 568–808 */}
        <Frame name="sun-arc-controls" width={390} height={240}>
          <div className={styles.at} style={{ left: 16, right: 16, top: 0 }}>
            <SegmentedControl
              label={s.modeLabel}
              shape="segment"
              options={[
                { value: 'fixed', label: s.modes.fixed },
                { value: 'every', label: s.modes.every },
                { value: 'prn', label: s.modes.prn },
              ]}
              value="fixed"
              onChange={noop}
            />
          </div>
          <div className={styles.at} style={{ left: 16, right: 16, top: 58 }}>
            <div className={styles.chipRow}>
              <ChoiceGroup
                label={s.timesLabel}
                chip="number"
                options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))}
                value={null}
                onChange={noop}
              />
              <span className={styles.aside}>{s.aDay}</span>
            </div>
          </div>
          <div className={styles.at} style={{ left: 20, right: 20, top: 116 }}>
            <Summary title={s.summaryEmpty.title} detail={s.summaryEmpty.detail} />
          </div>
          <div className={styles.at} style={{ left: 16, right: 16, top: 184 }}>
            <Button fullWidth pending iconEnd="arrow">
              {s.nextHowLong}
            </Button>
          </div>
        </Frame>

        {/* AddMedicine.dc.html, y 66–138 */}
        <Frame name="builder-name" width={390} height={72}>
          <div className={styles.at} style={{ left: 16, right: 16, top: 0 }}>
            <TextField label={s.nameLabel} hint={s.nameHint} defaultValue={s.nameValue} />
          </div>
        </Frame>

        {/* AddMedicine.dc.html, y 334–808 */}
        <Frame name="builder-controls" width={390} height={474}>
          <span className={styles.label} style={{ left: 20, top: 0 }}>
            {s.formLabel}
          </span>
          <div className={styles.at} style={{ left: 16, right: 16, top: 24 }}>
            <OptionGroup type="radio" label={s.formLabel} className={styles.forms}>
              {FORMS.map(([key, glyph, shape]) => (
                <ToggleCard
                  key={key}
                  layout="row"
                  shape={shape}
                  media={<Glyph name={glyph} size={36} />}
                  title={s.forms[key]}
                  checked={key === 'capsule'}
                  onChange={noop}
                />
              ))}
            </OptionGroup>
          </div>
          <div
            className={`${styles.at ?? ''} ${styles.colorRow ?? ''}`}
            style={{ left: 16, right: 16, top: 146 }}
          >
            <span className={styles.rowLabel}>{s.colorLabel}</span>
            <SegmentedControl
              label={s.capsuleHalfLabel}
              options={[
                { value: 'cap', label: s.capsuleHalves.cap },
                { value: 'body', label: s.capsuleHalves.body },
              ]}
              value="cap"
              onChange={noop}
              className={styles.halves}
            />
          </div>
          <div className={styles.at} style={{ left: 22, right: 22, top: 200 }}>
            <OptionGroup type="radio" label={s.colorGroupLabel} className={styles.swatches}>
              {PILL_COLORS.map((c) => (
                <Swatch
                  key={c}
                  color={c}
                  label={copy.graphics.pillColors[c]}
                  checked={c === 'red'}
                  onChange={noop}
                />
              ))}
            </OptionGroup>
          </div>
          <div
            className={`${styles.at ?? ''} ${styles.stepperRow ?? ''}`}
            style={{ left: 16, right: 16, top: 314 }}
          >
            <span className={styles.rowLabel}>{s.eachTime}</span>
            <Stepper
              label={s.eachTime}
              value={1}
              onChange={noop}
              steps={[1, 2, 3, 4]}
              format={(n) => ({ value: String(n), unit: n > 1 ? s.capsules : s.capsule })}
              decreaseLabel={s.less}
              increaseLabel={s.more}
            />
          </div>
          <p className={styles.note} style={{ left: 20, right: 20, top: 374 }}>
            {s.quantitySummary}
          </p>
          <div className={styles.at} style={{ left: 16, right: 16, top: 418 }}>
            <Button fullWidth iconEnd="arrow">
              {s.nextWhen}
            </Button>
          </div>
        </Frame>

        {/* Rules.dc.html, y 148–578 */}
        <Frame name="rules" width={390} height={430}>
          <div className={styles.at} style={{ left: 16, right: 16, top: 0 }}>
            <OptionGroup type="checkbox" label={s.rulesLabel} className={styles.rules}>
              {RULES.map(([key, glyph, shape]) => (
                <ToggleCard
                  key={key}
                  layout="stack"
                  stamp
                  shape={shape}
                  media={<Glyph name={glyph} size={62} />}
                  title={s.rules[key]}
                  checked={key === 'food'}
                  onChange={noop}
                />
              ))}
              <ToggleCard
                layout="stack"
                dashed
                shape={3}
                title={s.noRules}
                checked={false}
                onChange={noop}
              />
            </OptionGroup>
          </div>
        </Frame>

        {/* Start.dc.html, y 527.5–661.5 */}
        <Frame name="start-buttons" width={390} height={134}>
          <div className={styles.at} style={{ left: 20, right: 20, top: 0 }}>
            <Button fullWidth size={64} iconStart="plus" className={styles.gap12}>
              {s.newSchedule}
            </Button>
          </div>
          <div className={styles.at} style={{ left: 20, right: 20, top: 78 }}>
            <Button fullWidth variant="secondary" iconStart="qr" className={styles.gap12}>
              {s.scanSheet}
            </Button>
          </div>
        </Frame>

        {/* DesktopEntry.dc.html, x 40–800, y 94–178 */}
        <Frame name="desktop-rail" width={760} height={84}>
          <StepRail label={s.stepsSpecimenLabel}>
            {s.steps.map((item, i) => (
              <StepRailItem
                key={item.title}
                number={i + 1}
                title={item.title}
                summary={item.summary}
                current={i === 1}
                done={i === 0}
                doneLabel={s.done}
                onSelect={noop}
              />
            ))}
          </StepRail>
        </Frame>

        {/* DesktopEntry.dc.html, x 40–800, y 1210.9–1270.9 */}
        <Frame name="desktop-actions" width={760} height={60}>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              desktop
              iconStart="back"
              hint={
                <>
                  <Kbd>{s.keys.shift}</Kbd>
                  <Kbd>{s.keys.enter}</Kbd>
                </>
              }
            >
              {s.back}
            </Button>
            <Button size={60} iconEnd="arrow" hint={<Kbd>{s.keys.enter}</Kbd>}>
              {s.continue}
            </Button>
          </div>
        </Frame>
      </div>
    </section>
  );
}
