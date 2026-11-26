/**
 * The four step panels of the desktop split view (DesktopEntry.dc.html). They use the
 * same domain rules and draft actions as the phone screens, at desktop sizes.
 */
import { useState } from 'react';

import {
  Animated,
  Button,
  ChoiceGroup,
  HandNote,
  Kbd,
  NumberField,
  OptionGroup,
  SegmentedControl,
  Stepper,
  StepperButton,
  Summary,
  Swatch,
  TextField,
  ToggleCard,
} from '@/components';
import { copy } from '@/copy/en';
import { cx } from '@/lib/cx';
import {
  activeTimesADay,
  activeUsualLength,
  colorLabel,
  COURSE_UNITS,
  EVERY_HOURS,
  hasTwoColors,
  howLongSummary,
  MAX_COURSE_AMOUNT,
  MAX_PER_DAY,
  PILL_COLORS,
  PILL_FORMS,
  QTY_STEPS,
  quantityParts,
  RULES,
  USUAL_LENGTHS,
  whenSummary,
  type ColorPart,
  type Medicine,
  type PillForm,
} from '@/domain';
import { Glyph, type GlyphName } from '@/graphics';
import { draftStore } from '@/store';

import { RULE_GLYPH } from '../flow';
import { Plate } from '../pill-builder/Plate';
import { SunArc } from '../sun-arc/SunArc';
import type { WhenControls } from '../sun-arc/useWhen';
import styles from './panels.module.css';

const FORM_GLYPH: Record<PillForm, GlyphName> = {
  tablet: 'form-tablet',
  oval: 'form-oval',
  capsule: 'form-capsule',
  liquid: 'form-liquid',
  drops: 'form-drops',
  inhaler: 'form-inhaler',
};

const shapeOf = (i: number) => ((i % 3) + 1) as 1 | 2 | 3;

const m = copy.screens.medicine;
const w = copy.screens.when;
const h = copy.screens.howLong;
const r = copy.screens.rules;
const d = copy.screens.desktop;

/** Step 1: the name, the dose on a large plate, and the controls beside it. */
export function MedicinePanel({ medicine }: { medicine: Medicine }) {
  const [part, setPart] = useState<ColorPart>('cap');
  const draft = draftStore.getState();
  const twoColors = hasTwoColors(medicine.form);
  const target = twoColors && part === 'body' ? medicine.color2 : medicine.color;
  return (
    <div className={styles.stack}>
      <TextField
        label={m.nameLabel}
        hint={m.nameHint}
        size="desktop"
        value={medicine.name}
        autoComplete="off"
        maxLength={60}
        data-step-focus=""
        onChange={(event) => {
          draft.setName(event.currentTarget.value);
        }}
      />
      <div className={styles.builder}>
        <Plate medicine={medicine} onScoreChange={draft.setScore} size="desktop" />
        <div className={styles.builderControls}>
          <span id="desk-form" className={styles.label}>
            {m.form}
          </span>
          <OptionGroup type="radio" labelledBy="desk-form" className={styles.forms}>
            {PILL_FORMS.map((form, i) => (
              <ToggleCard
                key={form}
                layout="row"
                size="desktop"
                shape={shapeOf(i)}
                media={<Glyph name={FORM_GLYPH[form]} size={40} />}
                title={m.forms[form]}
                value={form}
                checked={medicine.form === form}
                onChange={() => {
                  draft.setForm(form);
                  setPart('cap');
                }}
              />
            ))}
          </OptionGroup>
          <div className={styles.colorRow}>
            <span className={styles.label}>{colorLabel(medicine.form, copy.domain)}</span>
            {twoColors && (
              <SegmentedControl
                label={m.halfLabel}
                options={[
                  { value: 'cap', label: m.halves.cap },
                  { value: 'body', label: m.halves.body },
                ]}
                value={part}
                onChange={setPart}
                className={styles.halves}
              />
            )}
          </div>
          <OptionGroup type="radio" label={m.colorGroup} className={styles.swatches}>
            {PILL_COLORS.map((c) => (
              <Swatch
                key={c}
                color={c}
                size={56}
                ring="surface"
                label={copy.graphics.pillColors[c]}
                checked={target === c}
                onChange={() => {
                  draft.setColor(c, part);
                }}
              />
            ))}
          </OptionGroup>
          <div className={styles.stepperRow}>
            <span className={styles.label}>{m.eachTime}</span>
            <Stepper
              label={m.eachTime}
              value={medicine.qty}
              steps={QTY_STEPS[medicine.form]}
              size={56}
              valueWidth={96}
              valueSize={36}
              onChange={(qty) => {
                draft.stepQty(qty > medicine.qty ? 1 : -1);
              }}
              format={(qty) => quantityParts(medicine.form, qty, copy.domain)}
              decreaseLabel={m.less}
              increaseLabel={m.more}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Step 2: the desktop Sun Arc with its controls beside it. */
export function WhenPanel({
  medicine,
  when,
  error,
  attempts,
}: {
  medicine: Medicine;
  when: WhenControls;
  error: boolean;
  attempts: number;
}) {
  const { timing } = medicine;
  const summary = whenSummary(medicine, copy.domain, { variant: 'desktop', error });
  return (
    <div className={cx(styles.stack, styles.whenStack)}>
      <div className={styles.whenRow}>
        <SunArc
          size="desktop"
          medicine={medicine}
          sun={when.sun}
          delays={when.delays}
          showHint={false}
          nudge={error ? attempts : 0}
          onStop={when.onStop}
          onSunDrop={when.onSunDrop}
          onSunStep={when.onSunStep}
          onTouch={when.setTouched}
        />
        <div className={styles.whenControls}>
          <SegmentedControl
            label={w.modeLabel}
            orientation="vertical"
            size={52}
            options={[
              { value: 'fixed', label: w.modes.fixed },
              { value: 'every', label: d.everyHours },
              { value: 'whenNeeded', label: w.modes.whenNeeded },
            ]}
            value={timing.mode}
            onChange={when.onMode}
          />
          {timing.mode === 'fixed' && (
            <>
              <ChoiceGroup
                label={w.timesLabel}
                chip="number"
                size="desktop"
                columns={2}
                gap={8}
                options={([1, 2, 3, 4] as const).map((n) => ({ value: n, label: String(n) }))}
                value={activeTimesADay(timing)}
                onChange={when.onTimesADay}
              />
              <span className={styles.orPress}>
                {d.orPress} <Kbd>1</Kbd>–<Kbd>4</Kbd>
              </span>
            </>
          )}
          {timing.mode === 'every' && (
            <ChoiceGroup
              label={w.everyLabel}
              chip="text"
              size="desktop"
              columns={2}
              gap={8}
              options={EVERY_HOURS.map((hours) => ({ value: hours, label: w.hours(hours) }))}
              value={timing.everyHours}
              onChange={when.onEvery}
            />
          )}
          {timing.mode === 'whenNeeded' && (
            <div className={styles.maxBlock}>
              <span className={styles.label}>{w.maxLabel}</span>
              <Stepper
                label={w.maxLabel}
                value={timing.maxPerDay}
                min={MAX_PER_DAY.min}
                max={MAX_PER_DAY.max}
                size={56}
                valueWidth={44}
                valueSize={36}
                decreaseLabel={w.fewer}
                increaseLabel={w.more}
                onChange={(value) => {
                  when.onMaxPerDay(value > timing.maxPerDay ? 1 : -1);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <Summary
        title={summary.title}
        detail={summary.detail}
        tone={summary.tone === 'error' ? 'error' : 'default'}
        size={19}
      />
    </div>
  );
}

/** Step 3: the length, typed large, with the usual lengths. */
export function HowLongPanel({
  medicine,
  error,
  attempts,
}: {
  medicine: Medicine;
  error: boolean;
  attempts: number;
}) {
  const { course } = medicine;
  const draft = draftStore.getState();
  const summary = howLongSummary(medicine, copy.domain, { variant: 'desktop', error });
  return (
    <div className={styles.howLong}>
      <div className={styles.lengthRow}>
        <StepperButton
          direction="decrease"
          label={h.less}
          size={64}
          onClick={() => {
            draft.stepAmount(-1);
          }}
        />
        <Animated effect="nudge" replay={error ? attempts : 0}>
          <NumberField
            label={h.amountLabel}
            size="desktop"
            value={course.ongoing ? null : course.amount}
            max={MAX_COURSE_AMOUNT}
            invalid={error}
            disabled={course.ongoing}
            data-step-focus=""
            onChange={draft.setAmount}
          />
        </Animated>
        <StepperButton
          direction="increase"
          label={h.more}
          size={64}
          onClick={() => {
            draft.stepAmount(1);
          }}
        />
        <SegmentedControl
          label={h.unitLabel}
          orientation="vertical"
          options={COURSE_UNITS.map((unit) => ({ value: unit, label: h.units[unit] }))}
          value={course.unit}
          onChange={draft.setUnit}
          className={styles.unit}
        />
      </div>
      <ChoiceGroup
        label={h.usualLabel}
        chip="number"
        size="desktop"
        chipWidth={64}
        options={[
          ...USUAL_LENGTHS.map((n) => ({ value: n, label: String(n) })),
          { value: 'ongoing' as const, label: h.noEnd, chip: 'text' as const, width: 160 },
        ]}
        value={course.ongoing ? 'ongoing' : activeUsualLength(course)}
        onChange={(value) => {
          if (value === 'ongoing') draft.setOngoing(true);
          else draft.pickUsualLength(value);
        }}
      />
      <Summary
        title={summary.title}
        detail={summary.detail}
        tone={summary.tone === 'error' ? 'error' : 'default'}
        size={20}
      />
      <HandNote size={21} tone={summary.tone === 'error' ? 'error' : 'pen'}>
        {summary.note}
      </HandNote>
    </div>
  );
}

/** Step 4: the rules, four to a row, then the confirmation once added. */
export function RulesPanel({
  medicine,
  added,
}: {
  medicine: Medicine;
  added: { body: string; onPrint: () => void; onHousehold: () => void } | null;
}) {
  const draft = draftStore.getState();
  return (
    <div className={styles.stack}>
      <OptionGroup type="checkbox" label={r.groupLabel} className={styles.rules}>
        {RULES.map((rule, i) => (
          <ToggleCard
            key={rule}
            layout="stack"
            size="desktop"
            stamp
            shape={shapeOf(i)}
            media={<Glyph name={RULE_GLYPH[rule]} size={62} />}
            title={r.names[rule]}
            value={rule}
            checked={medicine.rules.includes(rule)}
            onChange={() => {
              draft.toggleRule(rule);
            }}
          />
        ))}
        <ToggleCard
          layout="stack"
          size="desktop"
          dashed
          shape={3}
          title={r.none}
          checked={medicine.rules.length === 0}
          onChange={draft.clearRules}
        />
      </OptionGroup>
      {added && (
        <Animated effect="fade" className={styles.added}>
          <Animated effect="stamp">
            <Glyph name="course-done" size={60} />
          </Animated>
          <span className={styles.addedText}>
            <span role="status" className={styles.addedStatus}>
              <span className={styles.addedTitle}>{d.added.title}</span>
              <span className={styles.addedBody}>{added.body}</span>
            </span>
            {/* Not in the design, which gives no other way out of the entry once added. */}
            <button type="button" className={styles.addedLink} onClick={added.onHousehold}>
              {d.added.household}
            </button>
          </span>
          <Button iconEnd="arrow" desktop onClick={added.onPrint} data-added-focus="">
            {d.added.print}
          </Button>
        </Animated>
      )}
    </div>
  );
}
