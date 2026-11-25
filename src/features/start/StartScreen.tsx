import { useNavigate } from 'react-router';

import { Button, Card, HandNote, ListRow } from '@/components';
import { copy } from '@/copy/en';
import { Glyph, HouseholdMark, Illustration } from '@/graphics';
import { logo } from '@/graphics/generated/illustrations/logo';
import { medicineBox } from '@/graphics/generated/illustrations/medicine-box';
import { startSky } from '@/graphics/generated/illustrations/start-sky';
import { draftStore, householdStore, useHousehold } from '@/store';

import {
  householdPath,
  SCAN_PATH,
  ScaledStage,
  ScreenLayout,
  STEP_PATHS,
  StorageNotice,
} from '../flow';

import styles from './StartScreen.module.css';

const t = copy.screens.start;

/** First launch and home: what Wordless does, a new schedule, and the ones already made. */
export function StartScreen() {
  const navigate = useNavigate();
  const people = useHousehold((s) => s.people);

  const newSchedule = () => {
    const person = householdStore.getState().addPerson(copy.screens.household.defaultLabel);
    if (!person) {
      // All four marks are in use: carry on with the household as it is.
      void navigate(householdPath(people[0]?.id));
      return;
    }
    draftStore.getState().start(person.id);
    void navigate(STEP_PATHS.medicine);
  };

  return (
    <ScreenLayout
      header={
        <div className={styles.brand}>
          <Illustration data={logo} width={40} />
          <span className={styles.wordmark}>{copy.app.name.toLowerCase()}</span>
        </div>
      }
    >
      <ScaledStage width={390} height={272} bleed className={styles.stage}>
        <Illustration data={startSky} width={390} className={styles.sky} />
        <Illustration
          data={medicineBox}
          width={330}
          label={copy.graphics.medicineBox}
          className={styles.box}
        />
      </ScaledStage>

      <div className={styles.content}>
        <StorageNotice />
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.lead}>{t.lead}</p>
        <Button
          size={64}
          fullWidth
          iconStart="plus"
          className={`${styles.cta ?? ''} ${styles.first ?? ''}`}
          onClick={newSchedule}
        >
          {t.newSchedule}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          iconStart="qr"
          className={styles.cta}
          href={SCAN_PATH}
        >
          {t.scan}
        </Button>

        <section className={styles.yours} aria-labelledby="start-yours">
          <h2 id="start-yours" className={styles.yoursTitle}>
            {t.yours}
          </h2>
          {people.length === 0 ? (
            <Card variant="dashed" className={styles.empty}>
              <Glyph name="when-needed" size={44} />
              <HandNote size={18} className={styles.emptyNote}>
                {t.empty}
              </HandNote>
            </Card>
          ) : (
            <ul className={styles.list}>
              {people.map((person) => (
                <li key={person.id}>
                  <ListRow
                    href={householdPath(person.id)}
                    media={<HouseholdMark mark={person.mark} size={40} />}
                    title={person.label}
                    subtitle={t.medicines(person.medicines.length)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ScreenLayout>
  );
}
