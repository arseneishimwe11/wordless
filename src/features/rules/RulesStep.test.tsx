import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { amoxicillin } from '@/test/fixtures';
import { draft, household, renderScreen, seed } from '@/test/screens';

import { RulesStep } from './RulesStep';

const PATH = '/entry/rules';

describe('RulesStep', () => {
  beforeEach(() => {
    seed({ medicine: amoxicillin({ rules: [] }) });
  });

  it('starts with no rules and says it prints just the pill', () => {
    renderScreen(<RulesStep />, PATH);
    expect(screen.getByRole('checkbox', { name: 'None of these' })).toBeChecked();
    expect(screen.getByText('no rules — just the pill')).toBeInTheDocument();
  });

  it('"With food" and "Empty stomach" lift each other; the rules show how they print', async () => {
    renderScreen(<RulesStep />, PATH);
    await userEvent.click(screen.getByRole('checkbox', { name: 'With food' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Keep cool' }));
    expect(screen.getByRole('img', { name: 'With food' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Empty stomach' }));
    expect(draft().medicine.rules).toEqual(['emptyStomach', 'keepCool']);
    expect(screen.getByRole('checkbox', { name: 'With food' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'None of these' }));
    expect(draft().medicine.rules).toEqual([]);
  });

  it('Done saves the medicine to its person and shows the household', async () => {
    renderScreen(<RulesStep />, PATH);
    await userEvent.click(screen.getByRole('checkbox', { name: 'With food' }));
    await userEvent.click(screen.getByRole('button', { name: 'Done: see the schedule' }));
    expect(household().people[0]?.medicines).toEqual([amoxicillin()]);
    expect(draft().personId).toBeNull();
    expect(screen.getByTestId('location')).toHaveTextContent('/household?person=p1');
  });
});
