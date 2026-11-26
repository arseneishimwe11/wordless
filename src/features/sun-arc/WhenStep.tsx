import { Button, Summary } from '@/components';
import { copy } from '@/copy/en';
import { quantity, scheduledDoses, whenSummary } from '@/domain';

import { HeaderAction, MedicineCard, ScreenLayout, StepHeader, useEntryStep } from '../flow';
import { SunArc } from './SunArc';
import { useWhen } from './useWhen';
import { WhenControls } from './WhenControls';
import styles from './WhenStep.module.css';

const t = copy.screens.when;

/** Step 2, the Sun Arc: when each dose goes in. */
export function WhenStep() {
  const step = useEntryStep('when');
  const { medicine } = step;
  const { timing } = medicine;
  const when = useWhen(medicine);
  const empty = timing.mode !== 'whenNeeded' && scheduledDoses(timing).length === 0;
  const summary = whenSummary(medicine, copy.domain, { error: step.error });

  return (
    <ScreenLayout
      header={
        <StepHeader
          step={step.number}
          total={step.total}
          label={step.label}
          backLabel={copy.screens.backToMedicine}
          onBack={step.back}
          action={<HeaderAction onClick={when.clear}>{copy.screens.clear}</HeaderAction>}
        />
      }
      footer={
        <Button fullWidth pending={empty} iconEnd="arrow" onClick={step.next}>
          {t.next}
        </Button>
      }
    >
      <MedicineCard medicine={medicine} detail={t.perDose(quantity(medicine, copy.domain))} />
      <h1 className={styles.title}>{t.title}</h1>

      <SunArc
        medicine={medicine}
        sun={when.sun}
        delays={when.delays}
        showHint={!when.touched}
        nudge={step.error ? step.attempts : 0}
        onStop={when.onStop}
        onSunDrop={when.onSunDrop}
        onSunStep={when.onSunStep}
        onTouch={when.setTouched}
      />

      <WhenControls
        timing={timing}
        onMode={when.onMode}
        onTimesADay={when.onTimesADay}
        onEvery={when.onEvery}
        onMaxPerDay={when.onMaxPerDay}
      />

      <Summary
        title={summary.title}
        detail={summary.detail}
        tone={summary.tone === 'error' ? 'error' : 'default'}
        className={styles.summary}
      />
    </ScreenLayout>
  );
}
