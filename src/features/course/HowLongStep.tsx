import {
  Animated,
  Button,
  ChoiceGroup,
  NumberField,
  SegmentedControl,
  StepperButton,
  Summary,
} from '@/components';
import { copy } from '@/copy/en';
import {
  activeUsualLength,
  COURSE_UNITS,
  howLongSummary,
  isMissing,
  MAX_COURSE_AMOUNT,
  quantity,
  scheduledDoses,
  USUAL_LENGTHS,
} from '@/domain';
import { draftStore } from '@/store';

import { MedicineCard, ScreenLayout, StepHeader, useEntryStep } from '../flow';
import { CourseGrid } from './CourseGrid';
import styles from './HowLongStep.module.css';

const t = copy.screens.howLong;

/** Step 3, the course: how many days, or no end date. */
export function HowLongStep() {
  const step = useEntryStep('howLong');
  const { medicine } = step;
  const { course } = medicine;
  const draft = draftStore.getState();
  const missing = isMissing(course);
  const summary = howLongSummary(medicine, copy.domain, { error: step.error });
  const doses = scheduledDoses(medicine.timing);
  const when =
    medicine.timing.mode === 'whenNeeded'
      ? copy.domain.rail.whenNeeded
      : doses.map((time) => copy.domain.times[time].name).join(', ');

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
        <Button fullWidth pending={missing} iconEnd="arrow" onClick={step.next}>
          {t.next}
        </Button>
      }
    >
      <MedicineCard medicine={medicine} detail={t.detail(quantity(medicine, copy.domain), when)} />
      <h1 className={styles.title}>{t.title}</h1>

      <div className={styles.lengthRow}>
        <StepperButton
          direction="decrease"
          label={t.less}
          size={52}
          onClick={() => {
            draft.stepAmount(-1);
          }}
        />
        <Animated effect="nudge" replay={step.error ? step.attempts : 0}>
          <NumberField
            label={t.amountLabel}
            value={course.ongoing ? null : course.amount}
            max={MAX_COURSE_AMOUNT}
            invalid={step.error}
            disabled={course.ongoing}
            onChange={draft.setAmount}
          />
        </Animated>
        <StepperButton
          direction="increase"
          label={t.more}
          size={52}
          onClick={() => {
            draft.stepAmount(1);
          }}
        />
        <SegmentedControl
          label={t.unitLabel}
          options={COURSE_UNITS.map((unit) => ({ value: unit, label: t.units[unit] }))}
          value={course.unit}
          onChange={draft.setUnit}
          className={styles.unit}
        />
      </div>

      <ChoiceGroup
        label={t.usualLabel}
        chip="number"
        chipWidth={52}
        numberSize={22}
        gap={6}
        options={[
          ...USUAL_LENGTHS.map((n) => ({ value: n, label: String(n) })),
          { value: 'ongoing' as const, label: t.noEnd, chip: 'label', wide: true },
        ]}
        value={course.ongoing ? 'ongoing' : activeUsualLength(course)}
        onChange={(value) => {
          if (value === 'ongoing') draft.setOngoing(true);
          else draft.pickUsualLength(value);
        }}
        className={styles.usual}
      />

      <CourseGrid medicine={medicine} note={summary.note} error={summary.tone === 'error'} />

      <Summary
        title={summary.title}
        detail={summary.detail}
        tone={summary.tone === 'error' ? 'error' : 'default'}
        className={styles.summary}
      />
    </ScreenLayout>
  );
}
