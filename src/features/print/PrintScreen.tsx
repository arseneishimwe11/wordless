import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { Animated, Button, HandNote, IconButton, SegmentedControl } from '@/components';
import { copy } from '@/copy/en';
import type { Person, ScheduleMeta } from '@/domain';
import { Glyph } from '@/graphics';
import { PRINT_OUTPUTS, prefsStore, useHousehold, usePrefs, type PrintOutput } from '@/store';

import { householdPath, ScaledStage, ScreenLayout } from '../flow';
import { DailyStrips } from '../sheet/DailyStrips';
import { FridgeSheet } from '../sheet/FridgeSheet';
import { PAGE } from '../sheet/layout';
import styles from './PrintScreen.module.css';

const t = copy.screens.print;

/** Today as YYYY-MM-DD, in the local calendar (what the code stores). */
const isoDay = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n, i) => String(n).padStart(i ? 2 : 4, '0'))
    .join('-');

/** Where the page sits in the preview: 0.43 of A4, from SheetPreview.dc.html. */
const PREVIEW = { left: 24, top: 12, width: 342, height: 484, scale: 0.43 } as const;

function Printable({
  output,
  person,
  meta,
  date,
  mono,
}: {
  output: PrintOutput;
  person: Person;
  meta: ScheduleMeta;
  date: string;
  mono: boolean;
}) {
  return output === 'sheet' ? (
    <FridgeSheet person={person} meta={meta} date={date} mono={mono} />
  ) : (
    <DailyStrips person={person} meta={meta} date={date} mono={mono} />
  );
}

/**
 * Print (SheetPreview.dc.html): the page slides out of the printer, colour or black
 * and white, fridge sheet or daily strips, then the browser's print dialog. Only the
 * A4 pages print.
 */
export function PrintScreen() {
  const [params] = useSearchParams();
  const people = useHousehold((s) => s.people);
  const preparedBy = useHousehold((s) => s.preparedBy);
  const mono = usePrefs((s) => s.mono);
  const output = usePrefs((s) => s.output);
  const [today] = useState(() => new Date());
  const [run, setRun] = useState(0);
  const person = people.find((p) => p.id === params.get('person')) ?? people[0];
  if (!person) return null;

  const meta: ScheduleMeta = { preparedBy, preparedOn: isoDay(today) };
  const date = copy.sheet.date(today);
  const again = () => {
    setRun((n) => n + 1);
  };

  return (
    <>
      <div className="screenOnly">
        <ScreenLayout
          header={
            <>
              <IconButton
                icon="back"
                label={copy.screens.back}
                href={householdPath(person.id)}
                className={styles.back}
              />
              <h1 className={styles.barTitle}>{t.title}</h1>
            </>
          }
          footer={
            <Button
              fullWidth
              onClick={() => {
                again();
                window.print();
              }}
            >
              {t.print}
            </Button>
          }
        >
          <ScaledStage width={390} height={506} bleed className={styles.stage}>
            <div className={styles.slot} aria-hidden="true">
              <span className={styles.slotLine} />
            </div>
            <div
              aria-hidden="true"
              className={styles.preview}
              style={{ left: PREVIEW.left, top: PREVIEW.top, width: PREVIEW.width }}
            >
              <Animated effect="print" replay={`${output}-${String(run)}`} className={styles.paper}>
                <span
                  className={styles.page}
                  style={{
                    width: PAGE.width,
                    height: PAGE.height,
                    transform: `scale(${String(PREVIEW.scale)})`,
                  }}
                >
                  <Printable output={output} person={person} meta={meta} date={date} mono={mono} />
                </span>
                <Animated
                  effect="stamp"
                  delay={1200}
                  replay={`${output}-${String(run)}`}
                  className={styles.stamp}
                >
                  <Glyph name="course-done" size={92} />
                </Animated>
              </Animated>
            </div>
            {/* Laid over the picture: pressing the page prints it again. */}
            <button
              type="button"
              aria-label={t.replay}
              className={styles.replay}
              style={{ left: PREVIEW.left, top: PREVIEW.top, width: PREVIEW.width }}
              onClick={again}
            />
          </ScaledStage>

          <SegmentedControl
            label={t.printer}
            options={[
              { value: 'color', label: t.color },
              { value: 'mono', label: t.mono },
            ]}
            value={mono ? 'mono' : 'color'}
            onChange={(value) => {
              prefsStore.getState().setMono(value === 'mono');
            }}
            className={styles.control}
          />
          <SegmentedControl
            label={t.what}
            options={PRINT_OUTPUTS.map((value) => ({ value, label: t.outputs[value] }))}
            value={output}
            onChange={(value) => {
              prefsStore.getState().setOutput(value);
              again();
            }}
            className={styles.controlNext}
          />
          <div className={styles.note}>
            <HandNote>{t.note}</HandNote>
          </div>
        </ScreenLayout>
      </div>

      {/* What actually prints: the pages at full A4 size. */}
      <div className="printOnly">
        <Printable output={output} person={person} meta={meta} date={date} mono={mono} />
      </div>
    </>
  );
}
