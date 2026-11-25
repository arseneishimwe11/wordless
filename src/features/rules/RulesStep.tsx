import { Animated, Button, HandNote, OptionGroup, ToggleCard } from '@/components';
import { copy } from '@/copy/en';
import { keyUnit, RULES } from '@/domain';
import { Glyph, PillUnit } from '@/graphics';
import { draftStore } from '@/store';

import { RULE_GLYPH, ScreenLayout, StepHeader, useEntryStep } from '../flow';
import styles from './RulesStep.module.css';

const t = copy.screens.rules;

/** The design rotates three corner shapes across the rule cards. */
const SHAPES = [3, 2, 1] as const;

/** Step 4: anything else the prescription says, and how it will print. */
export function RulesStep() {
  const step = useEntryStep('rules');
  const { medicine } = step;
  const draft = draftStore.getState();
  const unit = keyUnit(medicine);

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
          {t.done}
        </Button>
      }
    >
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.lead}>{t.lead}</p>

      <OptionGroup type="checkbox" label={t.groupLabel} className={styles.rules}>
        {RULES.map((rule, i) => (
          <ToggleCard
            key={rule}
            layout="stack"
            stamp
            shape={SHAPES[i % SHAPES.length]}
            media={<Glyph name={RULE_GLYPH[rule]} size={62} />}
            title={t.names[rule]}
            value={rule}
            checked={medicine.rules.includes(rule)}
            onChange={() => {
              draft.toggleRule(rule);
            }}
          />
        ))}
        <ToggleCard
          layout="stack"
          dashed
          shape={3}
          title={t.none}
          checked={medicine.rules.length === 0}
          onChange={draft.clearRules}
        />
      </OptionGroup>

      <section className={styles.prints} aria-labelledby="rules-prints">
        <h2 id="rules-prints" className={styles.printsTitle}>
          {t.howItPrints}
        </h2>
        <div className={styles.preview}>
          <PillUnit
            kind={unit}
            color={medicine.color}
            color2={medicine.color2}
            score={medicine.score}
            size={60}
            label={copy.screens.picture(medicine.name, copy.screens.forms[medicine.form])}
          />
          {medicine.rules.length ? (
            <span className={styles.marks}>
              {medicine.rules.map((rule) => (
                <Animated key={rule} effect="pop">
                  <Glyph name={RULE_GLYPH[rule]} size={44} label={t.names[rule]} />
                </Animated>
              ))}
            </span>
          ) : (
            <HandNote as="span">{t.noRules}</HandNote>
          )}
        </div>
      </section>
    </ScreenLayout>
  );
}
