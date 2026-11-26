import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';

import { Button, HandNote, Kbd, StepRail, StepRailItem } from '@/components';
import { copy } from '@/copy/en';
import {
  ENTRY_STEPS,
  railSummaries,
  stepIssue,
  type EntryStep,
  type Medicine,
  type Person,
  type TimesADay,
} from '@/domain';
import { Glyph, HouseholdMark } from '@/graphics';
import { draftStore, householdStore, useDraft, useHousehold } from '@/store';

import { householdPath, printPath, START_PATH, STEP_PATHS, useEntryStep } from '../flow';
import { useWhen } from '../sun-arc/useWhen';
import styles from './DesktopEntry.module.css';
import { LiveSheetColumn } from './LiveSheetColumn';
import { HowLongPanel, MedicinePanel, RulesPanel, WhenPanel } from './panels';

const d = copy.screens.desktop;

/** "Amoxicillin 500 mg and Paracetamol", for the other medicines already on the sheet. */
const others = (names: readonly string[]) => d.print.medicines(names);

/** The top bar shared by the desktop entry and print pages. */
export function DesktopTopBar({
  person,
  context,
  end,
}: {
  person: { label: string; mark: 'a' | 'b' | 'c' | 'd' };
  context: string;
  end: ReactNode;
}) {
  return (
    <header className={styles.top}>
      <Link to={START_PATH} className={styles.brand} aria-label={d.home}>
        <Glyph name="sunrise" size={40} />
        <span className={styles.wordmark} aria-hidden="true">
          {copy.app.name.toLowerCase()}
        </span>
      </Link>
      <p className={styles.who}>
        <HouseholdMark mark={person.mark} size={34} />
        <span>
          <strong>{person.label}</strong> · {context}
        </span>
      </p>
      {end}
    </header>
  );
}

/**
 * Entering a medicine on a computer (DesktopEntry.dc.html): the steps along the top,
 * one panel at a time, and the sheet redrawing beside it as you type. Everything works
 * from the keyboard: Tab, Enter, Shift + Enter, and on the When step 1–4 and the arrows.
 */
export function DesktopEntry({ step }: { step: EntryStep }) {
  const personId = useDraft((s) => s.personId);
  const person = useHousehold((s) => s.people.find((p) => p.id === personId));
  return person ? <Entry step={step} person={person} /> : null;
}

function Entry({ step, person }: { step: EntryStep; person: Person }) {
  const entry = useEntryStep(step);
  const navigate = useNavigate();
  const { medicine } = entry;
  const editingId = useDraft((s) => s.editingId);
  const when = useWhen(medicine);
  const [addedOn, setAddedOn] = useState<Medicine | null>(null);
  const pane = useRef<HTMLDivElement>(null);
  const added = addedOn === medicine;

  // Each step starts at its first field, as the design does.
  useEffect(() => {
    const root = pane.current;
    const target =
      root?.querySelector<HTMLElement>('section [data-step-focus]') ??
      root?.querySelector<HTMLElement>('section input, section button');
    target?.focus();
  }, [step]);

  // Once added, the next thing to do is print: focus goes to "Print preview".
  useEffect(() => {
    if (added) pane.current?.querySelector<HTMLElement>('[data-added-focus]')?.focus();
  }, [added]);

  const summaries = railSummaries(medicine, copy.domain, { rulesReached: step === 'rules' });
  const done = [
    true,
    stepIssue(medicine, 'when') === null,
    stepIssue(medicine, 'howLong') === null,
    added || (step === 'rules' && medicine.rules.length > 0),
  ];
  const savedNames = person.medicines.filter((m) => m.id !== medicine.id).map((m) => m.name);

  const add = () => {
    householdStore.getState().saveMedicine(person.id, medicine);
    draftStore.getState().markSaved();
    setAddedOn(draftStore.getState().medicine);
  };
  const cont = () => {
    if (step === 'rules') add();
    else entry.next();
  };

  /** The page's keys, from anywhere on it: the design's "Tab and Enter do everything". */
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof HTMLElement ? event.target : document.body;
    const tag = target.tagName.toLowerCase();
    if (event.key === 'Enter') {
      const onControl = tag === 'button' || tag === 'a';
      if (onControl && !target.hasAttribute('data-enter-continues')) return;
      event.preventDefault();
      if (event.shiftKey) {
        entry.back();
      } else cont();
      return;
    }
    // On the When step, away from the form fields: 1–4 place doses, the arrows move the sun.
    if (step !== 'when' || tag === 'input' || tag === 'textarea') return;
    if (/^[1-4]$/.test(event.key)) {
      event.preventDefault();
      when.onTimesADay(Number(event.key) as TimesADay);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      when.onSunStep(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  const onKey = useEffectEvent(onKeyDown);
  useEffect(() => {
    const listen = (event: KeyboardEvent) => {
      onKey(event);
    };
    document.addEventListener('keydown', listen);
    return () => {
      document.removeEventListener('keydown', listen);
    };
  }, []);

  const panels: Record<EntryStep, ReactNode> = {
    medicine: <MedicinePanel medicine={medicine} />,
    when: (
      <WhenPanel medicine={medicine} when={when} error={entry.error} attempts={entry.attempts} />
    ),
    howLong: <HowLongPanel medicine={medicine} error={entry.error} attempts={entry.attempts} />,
    rules: (
      <RulesPanel
        medicine={medicine}
        added={
          added
            ? {
                body: d.added.body(
                  medicine.name || copy.screens.unnamed,
                  person.label,
                  others(savedNames.filter(Boolean)),
                ),
                onPrint: () => {
                  draftStore.getState().reset();
                  void navigate(printPath(person.id));
                },
                onHousehold: () => {
                  draftStore.getState().reset();
                  void navigate(householdPath(person.id));
                },
              }
            : null
        }
      />
    ),
  };

  return (
    <div className={styles.page}>
      <DesktopTopBar
        person={person}
        context={
          editingId && !added ? d.changing(medicine.name || copy.screens.unnamed) : d.newMedicine
        }
        end={
          <p className={styles.keysHint}>
            <Kbd>{d.keys.tab}</Kbd> {d.doEverything.and} <Kbd>{d.keys.enter}</Kbd>{' '}
            {d.doEverything.rest}
          </p>
        }
      />
      <main className={styles.main}>
        <div ref={pane} className={styles.pane}>
          <StepRail label={d.stepsLabel}>
            {ENTRY_STEPS.map((s, i) => (
              <StepRailItem
                key={s}
                number={i + 1}
                title={copy.screens.steps[s]}
                summary={summaries[i] ?? ''}
                current={s === step}
                done={(done[i] ?? false) && s !== step}
                doneLabel={d.done}
                onSelect={() => {
                  void navigate(STEP_PATHS[s]);
                }}
              />
            ))}
          </StepRail>

          <section className={styles.panel} aria-labelledby="desk-title">
            <div className={styles.panelHead}>
              <h1 id="desk-title" className={styles.title}>
                {d.titles[step]}
              </h1>
              <HandNote as="span" size={20} className={styles.hint}>
                {d.hints[step]}
              </HandNote>
            </div>
            {panels[step]}
          </section>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              desktop
              iconStart="back"
              onClick={entry.back}
              hint={
                <>
                  <Kbd>{d.keys.shift}</Kbd>
                  <Kbd>{d.keys.enter}</Kbd>
                </>
              }
            >
              {d.back}
            </Button>
            <Button size={60} iconEnd="arrow" onClick={cont} hint={<Kbd>{d.keys.enter}</Kbd>}>
              {step === 'rules' ? d.add : d.continue}
            </Button>
          </div>

          <ul className={styles.legend} aria-label={d.keys.label}>
            <li>
              <Kbd>{d.keys.tab}</Kbd> {d.keys.nextField}
            </li>
            <li>
              <Kbd>{d.keys.enter}</Kbd> {d.keys.continue}
            </li>
            <li>
              <Kbd>{d.keys.left}</Kbd>
              <Kbd>{d.keys.right}</Kbd> {d.keys.moveSun}
            </li>
            <li>
              <Kbd>{d.keys.space}</Kbd> {d.keys.toggleDose}
            </li>
            <li>
              <Kbd>1</Kbd>–<Kbd>4</Kbd> {d.keys.timesADay}
            </li>
          </ul>
        </div>

        <LiveSheetColumn person={person} medicine={medicine} editingId={editingId} saved={added} />
      </main>
    </div>
  );
}
