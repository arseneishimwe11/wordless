import { useNavigate, useSearchParams } from 'react-router';

import { Button, HandNote, IconButton, ListRow, OptionGroup, PersonChip } from '@/components';
import { copy } from '@/copy/en';
import { HOUSEHOLD_MARKS, householdRow, keyUnit } from '@/domain';
import { Icon, PillUnit } from '@/graphics';
import { draftStore, householdStore, useHousehold } from '@/store';

import { PRINT_PATH, ScreenLayout, START_PATH, STEP_PATHS, StorageNotice } from '../flow';
import styles from './HouseholdScreen.module.css';
import { TodayGrid } from './TodayGrid';

const t = copy.screens.household;

/** Everyone's schedule: who, today's doses for the chosen person, their medicines. */
export function HouseholdScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const people = useHousehold((s) => s.people);
  const person = people.find((p) => p.id === params.get('person')) ?? people[0];

  if (!person) return null;

  const addPerson = () => {
    const added = householdStore.getState().addPerson(t.defaultLabel);
    if (!added) return;
    draftStore.getState().start(added.id);
    void navigate(STEP_PATHS.medicine);
  };

  return (
    <ScreenLayout
      header={
        <>
          <IconButton
            icon="back"
            label={copy.screens.back}
            href={START_PATH}
            className={styles.back}
          />
          <span className={styles.barTitle}>{t.title}</span>
        </>
      }
      footer={
        <Button fullWidth iconEnd="arrow" href={PRINT_PATH}>
          {t.print}
        </Button>
      }
    >
      <div className={styles.who}>
        <OptionGroup type="radio" label={t.who} className={styles.people}>
          {people.map((p) => (
            <PersonChip
              key={p.id}
              mark={p.mark}
              name={p.label}
              checked={p.id === person.id}
              onChange={() => {
                setParams({ person: p.id }, { replace: true });
              }}
            />
          ))}
        </OptionGroup>
        {people.length < HOUSEHOLD_MARKS.length && (
          <button
            type="button"
            className={styles.addPerson}
            aria-label={t.addPerson}
            onClick={addPerson}
          >
            <Icon name="plus" />
          </button>
        )}
      </div>

      <StorageNotice />
      <h1 className={styles.title}>{t.today(person.label)}</h1>
      <TodayGrid person={person} label={t.todayLabel(person.label)} />

      <ul className={styles.list}>
        {person.medicines.map((m) => {
          const unit = keyUnit(m);
          return (
            <li key={m.id}>
              <ListRow
                href={STEP_PATHS.medicine}
                onClick={() => {
                  draftStore.getState().start(person.id, m);
                }}
                media={
                  <PillUnit
                    kind={unit}
                    color={m.color}
                    color2={m.color2}
                    score={m.score}
                    size={unit === 'capsule' ? 46 : 40}
                  />
                }
                title={m.name || copy.screens.unnamed}
                subtitle={householdRow(m, copy.domain)}
              />
            </li>
          );
        })}
      </ul>
      <div className={styles.addMedicine}>
        <Button
          variant="dashed"
          size={52}
          fullWidth
          iconStart="plus"
          href={STEP_PATHS.medicine}
          onClick={() => {
            draftStore.getState().start(person.id);
          }}
        >
          {t.addMedicine}
        </Button>
      </div>

      <div className={styles.note}>
        <HandNote>{t.markNote}</HandNote>
      </div>
    </ScreenLayout>
  );
}
