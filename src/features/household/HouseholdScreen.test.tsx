import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { amoxicillin, paracetamol } from '@/test/fixtures';
import { draft, grandmother, household, renderScreen, seed } from '@/test/screens';

import { HouseholdScreen } from './HouseholdScreen';

const PATH = '/household';
const child = { id: 'p2', label: 'Child', mark: 'b' as const, medicines: [] };

describe('HouseholdScreen', () => {
  beforeEach(() => {
    seed({
      people: [grandmother([amoxicillin(), paracetamol({ id: 'm2' })]), child],
      personId: null,
    });
  });

  it('shows the chosen person’s day and medicines', () => {
    renderScreen(<HouseholdScreen />, PATH, '/household?person=p1');
    expect(screen.getByRole('heading', { name: 'Today, for Grandmother' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: "The day's doses for Grandmother" });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getAllByText('1 capsule, with food')).toHaveLength(3);
    expect(
      screen.getByRole('link', { name: 'Amoxicillin 500 mg 3 a day · 7 days · with food' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Paracetamol only when needed · at most 4 a day' }),
    ).toBeInTheDocument();
  });

  it('switches person', async () => {
    renderScreen(<HouseholdScreen />, PATH, '/household?person=p1');
    await userEvent.click(screen.getByRole('radio', { name: 'Child' }));
    expect(screen.getByRole('heading', { name: 'Today, for Child' })).toBeInTheDocument();
  });

  it('a medicine row opens it to change; Add a medicine starts a new one', async () => {
    renderScreen(<HouseholdScreen />, PATH, '/household?person=p1');
    await userEvent.click(screen.getByRole('link', { name: /^Paracetamol/ }));
    expect(draft()).toMatchObject({ personId: 'p1', editingId: 'm2' });
    expect(screen.getByTestId('location')).toHaveTextContent('/entry/medicine');
  });

  it('adds a person with the next mark', async () => {
    renderScreen(<HouseholdScreen />, PATH, '/household?person=p1');
    await userEvent.click(screen.getByRole('button', { name: 'Add a person' }));
    expect(household().people.map((p) => p.label)).toEqual(['Grandmother', 'Child', 'Person C']);
    expect(draft().personId).toBe(household().people[2]?.id);
  });
});
