import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import type { Medicine, Person } from '@/domain';
import { draftStore, emptyDraft, householdStore } from '@/store';

import { amoxicillin } from './fixtures';

/** Shows where navigation went, for screens that move on. */
function Elsewhere() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}

/** Renders a screen at its own path; any navigation away renders the new address instead. */
export function renderScreen(ui: ReactElement, path: string, entry: string = path) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={<Elsewhere />} />
      </Routes>
    </MemoryRouter>,
  );
}

export const grandmother = (medicines: Medicine[] = []): Person => ({
  id: 'p1',
  label: 'Grandmother',
  mark: 'a',
  medicines,
});

/** Puts the stores in a known, loaded state (saving goes nowhere in tests). */
export function seed({
  people = [grandmother()],
  medicine = amoxicillin(),
  personId = 'p1',
  editingId = null,
}: {
  people?: Person[];
  medicine?: Medicine;
  personId?: string | null;
  editingId?: string | null;
} = {}) {
  householdStore.setState({
    people,
    preparedBy: '',
    status: 'ready',
    loadError: null,
    saveFailed: false,
  });
  draftStore.setState({
    ...emptyDraft(),
    personId,
    editingId,
    medicine,
    status: 'ready',
    loadError: null,
    saveFailed: false,
  });
}

export const draft = () => draftStore.getState();
export const household = () => householdStore.getState();
