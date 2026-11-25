import { useState } from 'react';

import {
  Button,
  OptionGroup,
  SegmentedControl,
  Stepper,
  Swatch,
  TextField,
  ToggleCard,
} from '@/components';
import { copy } from '@/copy/en';
import {
  builderSummary,
  colorLabel,
  hasTwoColors,
  PILL_COLORS,
  PILL_FORMS,
  QTY_STEPS,
  quantityParts,
  type ColorPart,
  type PillForm,
} from '@/domain';
import { Glyph, type GlyphName } from '@/graphics';
import { draftStore } from '@/store';

import { ScreenLayout, StepHeader, useEntryStep } from '../flow';
import styles from './MedicineStep.module.css';
import { Plate } from './Plate';

const t = copy.screens.medicine;

const FORM_GLYPH: Record<PillForm, GlyphName> = {
  tablet: 'form-tablet',
  oval: 'form-oval',
  capsule: 'form-capsule',
  liquid: 'form-liquid',
  drops: 'form-drops',
  inhaler: 'form-inhaler',
};

/** The design rotates three corner shapes across the form cards. */
const shapeOf = (i: number) => ((i % 3) + 1) as 1 | 2 | 3;

/** Step 1, the Pill Builder: the medicine drawn the way it looks in the hand. */
export function MedicineStep() {
  const step = useEntryStep('medicine');
  const { medicine } = step;
  const [part, setPart] = useState<ColorPart>('cap');
  const draft = draftStore.getState();
  const twoColors = hasTwoColors(medicine.form);
  const target = twoColors && part === 'body' ? medicine.color2 : medicine.color;

  return (
    <ScreenLayout
      header={
        <StepHeader
          step={step.number}
          total={step.total}
          label={step.label}
          backLabel={copy.screens.back}
          onBack={step.back}
        />
      }
      footer={
        <Button fullWidth iconEnd="arrow" onClick={step.next}>
          {t.next}
        </Button>
      }
    >
      {/* The design shows no title here; the page still needs one for screen readers. */}
      <h1 className="visuallyHidden">{t.title}</h1>
      <TextField
        label={t.nameLabel}
        hint={t.nameHint}
        value={medicine.name}
        autoComplete="off"
        maxLength={60}
        onChange={(event) => {
          draft.setName(event.currentTarget.value);
        }}
        className={styles.name}
      />

      <Plate medicine={medicine} onScoreChange={draft.setScore} />

      <span id="builder-form" className={styles.label}>
        {t.form}
      </span>
      <OptionGroup type="radio" labelledBy="builder-form" className={styles.forms}>
        {PILL_FORMS.map((form, i) => (
          <ToggleCard
            key={form}
            layout="row"
            shape={shapeOf(i)}
            media={<Glyph name={FORM_GLYPH[form]} size={36} />}
            title={t.forms[form]}
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
        <span id="builder-color" className={styles.rowLabel}>
          {colorLabel(medicine.form, copy.domain)}
        </span>
        {twoColors && (
          <SegmentedControl
            label={t.halfLabel}
            options={[
              { value: 'cap', label: t.halves.cap },
              { value: 'body', label: t.halves.body },
            ]}
            value={part}
            onChange={setPart}
            className={styles.halves}
          />
        )}
      </div>
      <OptionGroup type="radio" label={t.colorGroup} className={styles.swatches}>
        {PILL_COLORS.map((c) => (
          <Swatch
            key={c}
            color={c}
            label={copy.graphics.pillColors[c]}
            checked={target === c}
            onChange={() => {
              draft.setColor(c, part);
            }}
          />
        ))}
      </OptionGroup>

      <div className={styles.stepperRow}>
        <span className={styles.rowLabel}>{t.eachTime}</span>
        <Stepper
          label={t.eachTime}
          value={medicine.qty}
          steps={QTY_STEPS[medicine.form]}
          onChange={(qty) => {
            draft.stepQty(qty > medicine.qty ? 1 : -1);
          }}
          format={(qty) => quantityParts(medicine.form, qty, copy.domain)}
          decreaseLabel={t.less}
          increaseLabel={t.more}
        />
      </div>
      <p aria-live="polite" className={styles.summary}>
        {builderSummary(medicine, copy.domain)}
      </p>
    </ScreenLayout>
  );
}
