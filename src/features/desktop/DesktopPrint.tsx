import { useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';

import {
  Animated,
  Button,
  Checkbox,
  Kbd,
  OptionGroup,
  SegmentedControl,
  Stepper,
  ToggleCard,
} from '@/components';
import { copy } from '@/copy/en';
import type { Person, ScheduleMeta } from '@/domain';
import { Glyph, Icon, type GlyphName } from '@/graphics';
import { cx } from '@/lib/cx';
import { prefsStore, useHousehold, usePrefs } from '@/store';

import { householdPath } from '../flow';
import { DailyStrips } from '../sheet/DailyStrips';
import { FridgeSheet } from '../sheet/FridgeSheet';
import { PAGE } from '../sheet/layout';
import { ScheduleQr } from '../sheet/ScheduleQr';
import { DesktopTopBar } from './DesktopEntry';
import styles from './DesktopPrint.module.css';

const t = copy.screens.desktop.print;

type Output = 'sheet' | 'strips' | 'both';

const MAX_COPIES = 5;

const CHECKS: readonly GlyphName[] = ['sunrise', 'taken', 'course-done'];

/** Today as YYYY-MM-DD, in the local calendar. */
const isoDay = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n, i) => String(n).padStart(i ? 2 : 4, '0'))
    .join('-');

function Pages({
  output,
  person,
  meta,
  date,
  mono,
}: {
  output: Output;
  person: Person;
  meta: ScheduleMeta;
  date: string;
  mono: boolean;
}) {
  return (
    <>
      {output !== 'strips' && <FridgeSheet person={person} meta={meta} date={date} mono={mono} />}
      {output !== 'sheet' && <DailyStrips person={person} meta={meta} date={date} mono={mono} />}
    </>
  );
}

/**
 * Printing on a computer (DesktopPrint.dc.html): what to print, colour or black and
 * white, how many copies, a checklist for handing it over, and a large preview.
 */
export function DesktopPrint() {
  const [params] = useSearchParams();
  const people = useHousehold((s) => s.people);
  const preparedBy = useHousehold((s) => s.preparedBy);
  const mono = usePrefs((s) => s.mono);
  const remembered = usePrefs((s) => s.output);
  const [output, setOutput] = useState<Output>(remembered);
  const [copies, setCopies] = useState(1);
  const [checks, setChecks] = useState([false, false, false]);
  const [run, setRun] = useState(0);
  const [printed, setPrinted] = useState(false);
  const [today] = useState(() => new Date());
  const person = people.find((p) => p.id === params.get('person')) ?? people[0];
  if (!person) return null;

  const meta: ScheduleMeta = { preparedBy, preparedOn: isoDay(today) };
  const date = copy.sheet.date(today);
  const both = output === 'both';
  const scale = both ? 0.54 : 0.74;
  const page = { width: Math.round(PAGE.width * scale), height: Math.round(PAGE.height * scale) };
  const names = person.medicines.map((m) => m.name || copy.screens.unnamed);
  const what = both ? t.captionBoth : t.outputs[output].title;

  const print = () => {
    setRun((n) => n + 1);
    setPrinted(true);
    window.print();
  };
  const choose = (next: Output) => {
    setOutput(next);
    setRun((n) => n + 1);
    if (next !== 'both') prefsStore.getState().setOutput(next);
  };

  /** Enter prints, unless a control has the key. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tag = (event.target as HTMLElement).tagName.toLowerCase();
    if (event.key !== 'Enter' || ['button', 'a', 'input'].includes(tag)) return;
    event.preventDefault();
    print();
  };

  const preview = (kind: 'sheet' | 'strips') => (
    <div className={styles.slotPage} style={page}>
      <Animated effect="print" replay={`${output}-${String(run)}`} className={styles.paper}>
        <span
          className={styles.scaled}
          style={{
            width: PAGE.width,
            height: PAGE.height,
            transform: `scale(${String(scale)})`,
          }}
        >
          <Pages output={kind} person={person} meta={meta} date={date} mono={mono} />
        </span>
        {printed && (
          <Animated effect="stamp" delay={1200} replay={run} className={styles.stamp}>
            <Glyph name="course-done" size={both ? 72 : 104} label={t.printed} />
          </Animated>
        )}
      </Animated>
    </div>
  );

  return (
    <>
      {/* Enter, pressed anywhere outside a control, prints. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className={cx(styles.page, 'screenOnly')} onKeyDown={onKeyDown}>
        <DesktopTopBar
          person={person}
          context={t.medicines(names)}
          end={
            <Button
              variant="secondary"
              desktop
              size={48}
              iconStart="back"
              href={householdPath(person.id)}
            >
              {t.backToEditing}
            </Button>
          }
        />
        <main className={styles.main}>
          <aside className={styles.settings} aria-label={t.settings}>
            <div className={styles.heading}>
              <h1 className={styles.title}>{copy.screens.print.title}</h1>
              <span className={styles.hint}>{t.hint}</span>
            </div>

            <div className={cx(styles.group, styles.what)}>
              <span id="print-what" className={styles.label}>
                {t.what}
              </span>
              <OptionGroup type="radio" labelledBy="print-what" className={styles.options}>
                {(['sheet', 'strips', 'both'] as const).map((value) => (
                  <ToggleCard
                    key={value}
                    layout="option"
                    size="desktop"
                    value={value}
                    checked={output === value}
                    onChange={() => {
                      choose(value);
                    }}
                    media={
                      <span className={styles.optionIcons}>
                        {value !== 'strips' && <Icon name="print-sheet" size={40} />}
                        {value !== 'sheet' && <Icon name="print-strips" size={40} />}
                      </span>
                    }
                    title={t.outputs[value].title}
                    subtitle={t.outputs[value].subtitle}
                  />
                ))}
              </OptionGroup>
            </div>

            <div className={styles.group}>
              <span className={styles.label}>{copy.screens.print.printer}</span>
              <SegmentedControl
                label={copy.screens.print.printer}
                size={52}
                options={[
                  { value: 'color', label: copy.screens.print.color },
                  { value: 'mono', label: copy.screens.print.mono },
                ]}
                value={mono ? 'mono' : 'color'}
                onChange={(value) => {
                  prefsStore.getState().setMono(value === 'mono');
                }}
              />
              <span className={styles.note}>{t.printerNote}</span>
            </div>

            <div className={styles.copies}>
              <span className={styles.label}>{t.copies}</span>
              <Stepper
                label={t.copies}
                value={copies}
                min={1}
                max={MAX_COPIES}
                size={52}
                valueWidth={40}
                valueSize={32}
                decreaseLabel={t.fewer}
                increaseLabel={t.more}
                onChange={setCopies}
              />
            </div>

            <fieldset className={styles.checklist}>
              <legend className={styles.legend}>{t.checklist}</legend>
              {t.checks.map((words, i) => (
                <Checkbox
                  key={words}
                  checked={checks[i] ?? false}
                  onChange={() => {
                    setChecks((c) => c.map((on, k) => (k === i ? !on : on)));
                  }}
                  media={<Glyph name={CHECKS[i] ?? 'sunrise'} size={34} />}
                  label={words}
                  className={styles.check}
                />
              ))}
            </fieldset>

            <div className={styles.code}>
              <span className={styles.qr}>
                <ScheduleQr person={person} meta={meta} size={96} />
              </span>
              <span className={styles.codeText}>
                <strong>{t.codeTitle}</strong> {t.codeBody}
              </span>
            </div>

            <Button
              size={64}
              fullWidth
              onClick={print}
              hint={<Kbd>{copy.screens.desktop.keys.enter}</Kbd>}
            >
              {t.printN(copies)}
            </Button>
          </aside>

          <section className={styles.preview} aria-label={t.preview}>
            <div className={styles.slot} aria-hidden="true">
              <span className={styles.slotLine} />
            </div>
            <div className={styles.pages} aria-hidden="true">
              {output !== 'strips' && preview('sheet')}
              {output !== 'sheet' && preview('strips')}
            </div>
            <p aria-live="polite" className={styles.caption}>
              {t.caption(what, mono)}
            </p>
          </section>
        </main>
      </div>

      {/* What prints: every page, once per copy. */}
      <div className="printOnly">
        {Array.from({ length: copies }, (_, i) => (
          <Pages key={i} output={output} person={person} meta={meta} date={date} mono={mono} />
        ))}
      </div>
    </>
  );
}
