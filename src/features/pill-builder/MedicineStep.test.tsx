import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { medicine } from '@/test/fixtures';
import { draft, renderScreen, seed } from '@/test/screens';

import { MedicineStep } from './MedicineStep';

const PATH = '/entry/medicine';

describe('MedicineStep (the Pill Builder)', () => {
  beforeEach(() => {
    seed({ medicine: medicine() });
  });

  it('names the medicine and says what it is in words', async () => {
    renderScreen(<MedicineStep />, PATH);
    await userEvent.type(screen.getByLabelText(/Medicine name/), 'Paracetamol');
    expect(draft().medicine.name).toBe('Paracetamol');
    expect(screen.getByText('1 tablet · white')).toBeInTheDocument();
    expect(screen.getByText('Medicine · step 1 of 4')).toBeInTheDocument();
  });

  it('changing form resets the quantity; the score line is only for tablets and ovals', async () => {
    renderScreen(<MedicineStep />, PATH);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Score line' }));
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(draft().medicine).toMatchObject({ qty: 1.5, score: true });

    await userEvent.click(screen.getByRole('radio', { name: 'Liquid' }));
    expect(draft().medicine).toMatchObject({ form: 'liquid', qty: 5, score: false });
    expect(screen.queryByRole('checkbox', { name: 'Score line' })).not.toBeInTheDocument();
    expect(screen.getByText('Color of the liquid')).toBeInTheDocument();
    expect(screen.getByText('5 ml, 1 spoon of 5 ml · white')).toBeInTheDocument();
  });

  it('colours a capsule’s cap and body separately', async () => {
    renderScreen(<MedicineStep />, PATH);
    expect(screen.queryByRole('radiogroup', { name: 'Which half of the capsule' })).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Capsule' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Red, cross-hatch' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Body' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Yellow, dots' }));
    expect(draft().medicine).toMatchObject({ color: 'red', color2: 'yellow' });
    expect(screen.getByText('1 capsule · red cap, yellow body')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Yellow, dots' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Cap' }));
    expect(screen.getByRole('radio', { name: 'Red, cross-hatch' })).toBeChecked();
  });

  it('stops the quantity at the form’s ends', () => {
    seed({ medicine: medicine({ form: 'capsule', qty: 4 }) });
    renderScreen(<MedicineStep />, PATH);
    expect(screen.getByRole('button', { name: 'More' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/4\s*capsules/);
  });

  it('Next goes on to When', async () => {
    renderScreen(<MedicineStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Next: when' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/entry/when');
  });

  it('Back from a person with nothing saved takes them off again', async () => {
    renderScreen(<MedicineStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    expect(draft().personId).toBeNull();
  });

  it('Back from someone just added, with others in the household, returns to the household', async () => {
    seed({
      people: [
        { id: 'p0', label: 'Grandmother', mark: 'a', medicines: [] },
        { id: 'p1', label: 'Person B', mark: 'b', medicines: [] },
      ],
      medicine: medicine(),
    });
    renderScreen(<MedicineStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/household?person=p0');
  });
});
