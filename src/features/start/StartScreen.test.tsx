import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { householdStore } from '@/store';
import { amoxicillin } from '@/test/fixtures';
import { draft, grandmother, household, renderScreen, seed } from '@/test/screens';

import { StartScreen } from './StartScreen';

describe('StartScreen', () => {
  beforeEach(() => {
    seed({ people: [], personId: null });
  });

  it('first launch: what Wordless does, and nothing saved yet', () => {
    renderScreen(<StartScreen />, '/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Any prescription, in pictures.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('nothing here yet — the ones you make will wait here'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Scan a sheet' })).toHaveAttribute('href', '/scan');
  });

  it('New schedule adds a person and starts their first medicine', async () => {
    renderScreen(<StartScreen />, '/');
    await userEvent.click(screen.getByRole('button', { name: 'New schedule' }));
    expect(household().people).toMatchObject([{ label: 'Person A', mark: 'a' }]);
    expect(draft().personId).toBe(household().people[0]?.id);
    expect(screen.getByTestId('location')).toHaveTextContent('/entry/medicine');
  });

  it('lists the schedules already made', () => {
    seed({ people: [grandmother([amoxicillin()])], personId: null });
    renderScreen(<StartScreen />, '/');
    expect(screen.getByRole('link', { name: 'Grandmother 1 medicine' })).toHaveAttribute(
      'href',
      '/household?person=p1',
    );
  });

  it('says when saved schedules could not be read', () => {
    householdStore.setState({ loadError: 'corrupt' });
    renderScreen(<StartScreen />, '/');
    expect(screen.getByRole('status')).toHaveTextContent(/could not be read/);
  });
});
