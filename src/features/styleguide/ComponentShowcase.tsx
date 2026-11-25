import { useState, type ReactNode } from 'react';

import {
  Button,
  Card,
  Checkbox,
  ChoiceGroup,
  Eyebrow,
  HandNote,
  IconButton,
  Kbd,
  ListRow,
  NumberField,
  OptionGroup,
  PersonChip,
  SegmentedControl,
  StepperButton,
  StepProgress,
  StepRail,
  StepRailItem,
  Stepper,
  Summary,
  Swatch,
  TextField,
  ToggleCard,
} from '@/components';
import { copy } from '@/copy/en';
import { Glyph, Icon, PILL_COLORS, PillUnit, type GlyphName, type PillColor } from '@/graphics';

import styles from './ComponentShowcase.module.css';
import { Specimens } from './Specimens';

const t = copy.styleguide.components;
const s = t.sample;

type Mode = 'fixed' | 'every' | 'prn';
type Rule = keyof typeof s.rules;
const RULE_GLYPHS: Record<Rule, GlyphName> = {
  food: 'with-food',
  nofood: 'empty-stomach',
  water: 'with-water',
  noalc: 'no-alcohol',
  sleepy: 'sleepiness',
  cool: 'keep-cool',
  shake: 'shake-first',
};
const FORM_GLYPHS = {
  tablet: 'form-tablet',
  oval: 'form-oval',
  capsule: 'form-capsule',
  liquid: 'form-liquid',
  drops: 'form-drops',
  inhaler: 'form-inhaler',
} as const satisfies Record<keyof typeof s.forms, GlyphName>;
const CAPSULE_STEPS = [1, 2, 3, 4];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.group} aria-label={title}>
      <h3 className={styles.groupTitle}>{title}</h3>
      {children}
    </section>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.demo}>
      <span className={styles.demoLabel}>{label}</span>
      <div className={styles.demoBody}>{children}</div>
    </div>
  );
}

function Buttons() {
  return (
    <Group title={t.groups.buttons}>
      <Demo label={t.states.primary}>
        <Button size={64} iconStart="plus">
          {s.newSchedule}
        </Button>
        <Button iconEnd="arrow">{s.nextWhen}</Button>
        <Button size={52} iconEnd="arrow">
          {s.makeSchedule}
        </Button>
      </Demo>
      <Demo label={t.states.secondary}>
        <Button variant="secondary" iconStart="qr">
          {s.scanSheet}
        </Button>
        <Button variant="secondary" size={64}>
          {s.seeSheet}
        </Button>
        <Button variant="secondary" size={48} iconStart="back">
          {s.backToEditing}
        </Button>
      </Demo>
      <Demo label={t.states.dashed}>
        <Button variant="dashed" size={52} iconStart="plus">
          {s.addMedicine}
        </Button>
      </Demo>
      <Demo label={t.states.text}>
        <Button variant="text">{s.clear}</Button>
      </Demo>
      <Demo label={t.states.pending}>
        <Button pending iconEnd="arrow">
          {s.nextHowLong}
        </Button>
      </Demo>
      <Demo label={t.states.disabled}>
        <Button disabled iconEnd="arrow">
          {s.nextWhen}
        </Button>
        <Button variant="secondary" disabled>
          {s.scanSheet}
        </Button>
      </Demo>
      <Demo label={t.states.withHints}>
        <Button
          variant="secondary"
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
      </Demo>
      <Demo label={t.states.iconButtons}>
        <IconButton icon="back" label={s.backLabel} />
        <IconButton icon="edit" label={s.editLabel} />
      </Demo>
    </Group>
  );
}

function Choices() {
  const [mode, setMode] = useState<Mode>('fixed');
  const [times, setTimes] = useState<number | null>(3);
  const [every, setEvery] = useState<number | null>(8);
  const [length, setLength] = useState<number | 'ongoing' | null>(7);
  const [half, setHalf] = useState<'cap' | 'body'>('cap');
  const [form, setForm] = useState<keyof typeof s.forms>('capsule');
  const [rules, setRules] = useState<Rule[]>(['food']);
  const [output, setOutput] = useState<'sheet' | 'strips'>('sheet');
  const [color, setColor] = useState<PillColor>('red');
  const [who, setWho] = useState<'a' | 'b'>('a');

  const toggleRule = (rule: Rule) => (on: boolean) => {
    setRules((current) => {
      if (!on) return current.filter((r) => r !== rule);
      const exclusive = rule === 'food' ? 'nofood' : rule === 'nofood' ? 'food' : null;
      return [...current.filter((r) => r !== exclusive), rule];
    });
  };
  const modeOptions = (labels: Record<Mode, string>) =>
    (['fixed', 'every', 'prn'] as const).map((value) => ({ value, label: labels[value] }));

  return (
    <Group title={t.groups.choices}>
      <Demo label={t.states.phone}>
        <SegmentedControl
          label={s.modeLabel}
          options={modeOptions(s.modes)}
          value={mode}
          onChange={setMode}
          shape="segment"
          className={styles.wide}
        />
        <SegmentedControl
          label={s.capsuleHalfLabel}
          options={[
            { value: 'cap', label: s.capsuleHalves.cap },
            { value: 'body', label: s.capsuleHalves.body },
          ]}
          value={half}
          onChange={setHalf}
          className={styles.halves}
        />
        <SegmentedControl
          label={s.unitLabel}
          options={[
            { value: 'days', label: s.units.days },
            { value: 'weeks', label: s.units.weeks },
          ]}
          value="days"
          onChange={() => undefined}
          size={44}
        />
      </Demo>
      <Demo label={t.states.desktop}>
        <SegmentedControl
          label={s.modeLabel}
          options={modeOptions(s.modesDesktop)}
          value={mode}
          onChange={setMode}
          orientation="vertical"
          size={52}
          className={styles.vertical}
        />
      </Demo>
      <Demo label={s.timesLabel}>
        <ChoiceGroup
          label={s.timesLabel}
          chip="number"
          options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))}
          value={times}
          onChange={setTimes}
        />
        <span className={styles.aside}>{s.aDay}</span>
      </Demo>
      <Demo label={s.everyLabel}>
        <ChoiceGroup
          label={s.everyLabel}
          chip="text"
          options={[4, 6, 8, 12].map((n) => ({
            value: n,
            label: `${String(n)} h`,
            ...(n === 12 && { width: 82 }),
          }))}
          value={every}
          onChange={setEvery}
        />
      </Demo>
      <Demo label={s.lengthsLabel}>
        <ChoiceGroup
          label={s.lengthsLabel}
          chip="number"
          chipWidth={52}
          numberSize={22}
          options={[
            ...[5, 7, 10, 14].map((n) => ({ value: n, label: String(n) })),
            { value: 'ongoing' as const, label: s.noEnd, chip: 'text' as const, wide: true },
          ]}
          value={length}
          onChange={setLength}
          className={styles.wide}
        />
      </Demo>
      <Demo label={t.states.desktop}>
        <ChoiceGroup
          label={s.timesLabel}
          chip="number"
          size="desktop"
          options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))}
          value={times}
          onChange={setTimes}
          className={styles.desktopChips}
        />
      </Demo>
      <Demo label={s.formLabel}>
        <OptionGroup type="radio" label={s.formLabel} className={styles.forms}>
          {(Object.keys(FORM_GLYPHS) as (keyof typeof FORM_GLYPHS)[]).map((key, i) => (
            <ToggleCard
              key={key}
              layout="row"
              shape={([3, 2, 1] as const)[i % 3]}
              media={<Glyph name={FORM_GLYPHS[key]} size={36} />}
              title={s.forms[key]}
              value={key}
              checked={form === key}
              onChange={() => {
                setForm(key);
              }}
            />
          ))}
        </OptionGroup>
      </Demo>
      <Demo label={s.rulesLabel}>
        <OptionGroup type="checkbox" label={s.rulesLabel} className={styles.rules}>
          {(Object.keys(RULE_GLYPHS) as Rule[]).map((rule, i) => (
            <ToggleCard
              key={rule}
              layout="stack"
              stamp
              shape={([3, 2, 1] as const)[i % 3]}
              media={<Glyph name={RULE_GLYPHS[rule]} size={62} />}
              title={s.rules[rule]}
              checked={rules.includes(rule)}
              onChange={toggleRule(rule)}
            />
          ))}
          <ToggleCard
            layout="stack"
            dashed
            title={s.noRules}
            checked={rules.length === 0}
            onChange={() => {
              setRules([]);
            }}
          />
        </OptionGroup>
      </Demo>
      <Demo label={s.printLabel}>
        <OptionGroup type="radio" label={s.printLabel} className={styles.options}>
          {(['sheet', 'strips'] as const).map((key) => (
            <ToggleCard
              key={key}
              layout="option"
              shape={2}
              media={<Icon name={key === 'sheet' ? 'print-sheet' : 'print-strips'} />}
              title={s.print[key].title}
              subtitle={s.print[key].subtitle}
              checked={output === key}
              onChange={() => {
                setOutput(key);
              }}
            />
          ))}
        </OptionGroup>
      </Demo>
      <Demo label={s.colorGroupLabel}>
        <OptionGroup type="radio" label={s.colorGroupLabel} className={styles.swatches}>
          {PILL_COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              label={copy.graphics.pillColors[c]}
              checked={color === c}
              onChange={() => {
                setColor(c);
              }}
            />
          ))}
        </OptionGroup>
      </Demo>
      <Demo label={t.states.desktop}>
        <div className={styles.surfaceBox}>
          <OptionGroup type="radio" label={s.colorGroupLabel} className={styles.swatchesDesktop}>
            {PILL_COLORS.map((c) => (
              <Swatch
                key={c}
                color={c}
                size={56}
                ring="surface"
                label={copy.graphics.pillColors[c]}
                checked={color === c}
                onChange={() => {
                  setColor(c);
                }}
              />
            ))}
          </OptionGroup>
        </div>
      </Demo>
      <Demo label={s.whoLabel}>
        <OptionGroup type="radio" label={s.whoLabel} className={styles.row}>
          {(['a', 'b'] as const).map((mark) => (
            <PersonChip
              key={mark}
              mark={mark}
              name={s.people[mark]}
              checked={who === mark}
              onChange={() => {
                setWho(mark);
              }}
            />
          ))}
        </OptionGroup>
      </Demo>
    </Group>
  );
}

function Inputs() {
  const [name, setName] = useState<string>(s.nameValue);
  const [days, setDays] = useState<number | null>(7);
  const [qty, setQty] = useState(1);
  const [max, setMax] = useState(4);
  const [score, setScore] = useState(true);
  const capsules = (n: number) => ({ value: String(n), unit: n > 1 ? s.capsules : s.capsule });

  return (
    <Group title={t.groups.inputs}>
      <Demo label={t.states.phone}>
        <TextField
          label={s.nameLabel}
          hint={s.nameHint}
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
          className={styles.field}
        />
      </Demo>
      <Demo label={t.states.error}>
        <TextField
          label={s.nameLabel}
          hint={s.nameHint}
          error={s.nameError}
          defaultValue=""
          className={styles.field}
        />
      </Demo>
      <Demo label={t.states.desktop}>
        <TextField
          label={s.nameLabel}
          hint={s.nameHint}
          size="desktop"
          defaultValue={s.nameValue}
          className={styles.fieldWide}
        />
      </Demo>
      <Demo label={s.daysLabel}>
        <StepperButton
          direction="decrease"
          label={s.oneDayLess}
          size={52}
          onClick={() => {
            setDays((d) => Math.max(1, (d ?? 8) - 1));
          }}
        />
        <NumberField label={s.daysLabel} value={days} onChange={setDays} />
        <StepperButton
          direction="increase"
          label={s.oneDayMore}
          size={52}
          onClick={() => {
            setDays((d) => Math.min(90, (d ?? 6) + 1));
          }}
        />
        <NumberField label={s.daysLabel} value={null} onChange={() => undefined} invalid />
        <NumberField label={s.daysLabel} value={null} onChange={() => undefined} disabled />
      </Demo>
      <Demo label={t.states.desktop}>
        <NumberField label={s.daysLabel} value={days} onChange={setDays} size="desktop" />
      </Demo>
      <Demo label={s.eachTime}>
        <Stepper
          label={s.eachTime}
          value={qty}
          onChange={setQty}
          steps={CAPSULE_STEPS}
          format={capsules}
          decreaseLabel={s.less}
          increaseLabel={s.more}
        />
        <Stepper
          label={s.atMost}
          value={max}
          onChange={setMax}
          min={1}
          max={6}
          valueWidth={40}
          valueSize={32}
          decreaseLabel={s.oneFewer}
          increaseLabel={s.oneMore}
        />
        <span className={styles.aside}>{s.atMostNote}</span>
      </Demo>
      <Demo label={t.states.desktop}>
        <Stepper
          label={s.eachTime}
          value={qty}
          onChange={setQty}
          steps={CAPSULE_STEPS}
          format={capsules}
          size={56}
          valueWidth={96}
          valueSize={36}
          decreaseLabel={s.less}
          increaseLabel={s.more}
        />
      </Demo>
      <Demo label={s.scoreLine}>
        <Checkbox
          variant="pill"
          label={s.scoreLine}
          checked={score}
          onChange={(e) => {
            setScore(e.currentTarget.checked);
          }}
        />
        <div className={styles.column}>
          {s.checklist.map((line, i) => (
            <Checkbox
              key={line}
              label={line}
              media={
                <Glyph
                  name={(['sunrise', 'take-it', 'course-done'] as const)[i] ?? 'sunrise'}
                  size={34}
                />
              }
            />
          ))}
        </div>
      </Demo>
    </Group>
  );
}

function Wayfinding() {
  const [step, setStep] = useState(2);
  return (
    <Group title={t.groups.wayfinding}>
      <Demo label={t.states.phone}>
        {s.progress.map((label, i) => (
          <StepProgress key={label} current={i + 1} total={4} label={label} />
        ))}
      </Demo>
      <Demo label={t.states.desktop}>
        <StepRail label={s.stepsLabel} className={styles.rail}>
          {s.steps.map((item, i) => (
            <StepRailItem
              key={item.title}
              number={i + 1}
              title={item.title}
              summary={item.summary}
              current={step === i + 1}
              done={i + 1 < step}
              doneLabel={s.done}
              onSelect={() => {
                setStep(i + 1);
              }}
            />
          ))}
        </StepRail>
      </Demo>
      <Demo label={t.states.listRows}>
        <div className={styles.list}>
          {s.rows.map((row, i) => (
            <ListRow
              key={row.title}
              href="/styleguide"
              media={
                i === 0 ? (
                  <PillUnit kind="capsule" color="red" color2="yellow" size={46} />
                ) : (
                  <PillUnit kind="tablet" color="white" score size={40} />
                )
              }
              title={row.title}
              subtitle={row.subtitle}
            />
          ))}
        </div>
      </Demo>
    </Group>
  );
}

function Surfaces() {
  return (
    <Group title={t.groups.surfaces}>
      <div className={styles.cards}>
        <Card variant="well" className={styles.cardPad}>
          {s.cards.well}
        </Card>
        <Card variant="surface" className={styles.cardPad}>
          {s.cards.surface}
        </Card>
        <Card variant="dashed" className={styles.cardDashed}>
          <Glyph name="dose-if-needed-capsule" size={44} />
          <HandNote size={18}>{s.cards.dashed}</HandNote>
        </Card>
        <Card variant="panel">{s.cards.panel}</Card>
        <Card variant="feature">{s.cards.feature}</Card>
        <Card variant="sheet" className={styles.cardPad}>
          {s.cards.sheet}
        </Card>
      </div>
    </Group>
  );
}

function Text() {
  return (
    <Group title={t.groups.text}>
      <Demo label={s.keys.tab}>
        <span className={styles.keys}>
          <Kbd>{s.keys.tab}</Kbd> {s.keysCaption} <Kbd>{s.keys.enter}</Kbd> {s.keysNote}
        </span>
        <span className={styles.keys}>
          <Kbd>{s.keys.one}</Kbd>–<Kbd>{s.keys.four}</Kbd>
        </span>
      </Demo>
      <Demo label={s.eyebrow}>
        <Eyebrow>{s.eyebrow}</Eyebrow>
        <Eyebrow size={15}>{s.eyebrow}</Eyebrow>
      </Demo>
      <Demo label={s.hint}>
        <HandNote size={19}>{s.hint}</HandNote>
        <HandNote size={17} tone="error">
          {s.errorHint}
        </HandNote>
      </Demo>
      <Demo label={s.summary.title}>
        <Summary title={s.summary.title} detail={s.summary.detail} />
        <Summary title={s.summaryError.title} detail={s.summaryError.detail} tone="error" />
        <Summary title={s.summary.title} detail={s.summary.detail} size={19} />
      </Demo>
    </Group>
  );
}

/** Every primitive, in every variant and state, followed by exact-size specimens. */
export function ComponentShowcase() {
  return (
    <section className={styles.showcase} aria-labelledby="sg-components">
      <div className={styles.head}>
        <h2 id="sg-components" className={styles.title}>
          {t.title}
        </h2>
        <p className={styles.lead}>{t.lead}</p>
      </div>
      <Buttons />
      <Choices />
      <Inputs />
      <Wayfinding />
      <Surfaces />
      <Text />
      <Specimens />
    </section>
  );
}
