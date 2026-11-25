import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { copy } from '@/copy/en';
import { ENTRY_STEPS, stepIssue, type EntryStep, type Medicine, type StepIssue } from '@/domain';
import { draftStore, householdStore, useDraft } from '@/store';

import { householdPath, START_PATH, STEP_PATHS } from './paths';

export interface EntryStepState {
  medicine: Medicine;
  /** What stops this step from continuing, if anything. */
  issue: StepIssue | null;
  /** True after Next was pressed with an issue, until the medicine changes. */
  error: boolean;
  /** Counts the blocked presses, to replay the nudge each time. */
  attempts: number;
  /** "When · step 2 of 4", and the numbers for the progress bar. */
  label: string;
  number: number;
  total: number;
  next: () => void;
  back: () => void;
}

/**
 * One step of entering a medicine: where Next and Back go, and the error shown when
 * Next is pressed before the step is answered (the design's gentle nudge).
 */
export function useEntryStep(step: EntryStep): EntryStepState {
  const navigate = useNavigate();
  const medicine = useDraft((s) => s.medicine);
  const [failedOn, setFailedOn] = useState<Medicine | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Remember the step, so the desktop view (and a reload) can pick up here.
  useEffect(() => {
    if (draftStore.getState().step !== step) draftStore.getState().setStep(step);
  }, [step]);

  const index = ENTRY_STEPS.indexOf(step);
  const issue = stepIssue(medicine, step);

  const finish = () => {
    const { personId, medicine: done } = draftStore.getState();
    if (!personId) return;
    householdStore.getState().saveMedicine(personId, done);
    draftStore.getState().reset();
    void navigate(householdPath(personId));
  };

  /** Leaving from step 1. Someone added just now, with nothing entered yet, is taken off again. */
  const leave = () => {
    const { personId, editingId } = draftStore.getState();
    const person = householdStore.getState().people.find((p) => p.id === personId);
    draftStore.getState().reset();
    if (person?.medicines.length === 0 && editingId === null) {
      householdStore.getState().removePerson(person.id);
      const others = householdStore.getState().people;
      void navigate(others[0] ? householdPath(others[0].id) : START_PATH);
      return;
    }
    void navigate(person ? householdPath(person.id) : START_PATH);
  };

  const next = () => {
    if (issue) {
      setFailedOn(medicine);
      setAttempts((n) => n + 1);
      return;
    }
    const following = ENTRY_STEPS[index + 1];
    if (following) void navigate(STEP_PATHS[following]);
    else finish();
  };

  const back = () => {
    const previous = ENTRY_STEPS[index - 1];
    if (previous) void navigate(STEP_PATHS[previous]);
    else leave();
  };

  return {
    medicine,
    issue,
    error: issue !== null && failedOn === medicine,
    attempts,
    label: copy.screens.stepLabel(copy.screens.steps[step], index + 1, ENTRY_STEPS.length),
    number: index + 1,
    total: ENTRY_STEPS.length,
    next,
    back,
  };
}
