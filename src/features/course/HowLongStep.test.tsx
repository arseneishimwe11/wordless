import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { amoxicillin } from '@/test/fixtures';
import { draft, renderScreen, seed } from '@/test/screens';

import { HowLongStep } from './HowLongStep';

const PATH = '/entry/how-long';
const missing = () => amoxicillin({ course: { amount: null } });

describe('HowLongStep (the course grid)', () => {
  beforeEach(() => {
    seed({ medicine: missing() });
  });

  it('starts missing, with a dotted week of boxes', () => {
    renderScreen(<HowLongStep />, PATH);
    expect(screen.getByText('How long is missing')).toBeInTheDocument();
    expect(screen.getByText('1 capsule · sunrise, midday, sunset')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'How long, as a number' })).toHaveValue(null);
  });

  it('Next with no length says what is missing, and marks the field', async () => {
    renderScreen(<HowLongStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Next: rules' }));
    expect(screen.getByText('Add how long first')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
  });

  it('typing, − and +, and the usual lengths', async () => {
    renderScreen(<HowLongStep />, PATH);
    await userEvent.type(screen.getByRole('spinbutton'), '10');
    expect(draft().medicine.course).toMatchObject({ amount: 10, ongoing: false });
    expect(screen.getByText('10 days · 30 capsules in all')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '10' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'One day more' }));
    expect(draft().medicine.course.amount).toBe(11);
    await userEvent.click(screen.getByRole('radio', { name: '5' }));
    expect(screen.getByText('5 days · 15 capsules in all')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'weeks' }));
    expect(screen.getByText('35 days · 105 capsules in all')).toBeInTheDocument();
    expect(screen.getByText(/and 21 more days like these/)).toBeInTheDocument();
  });

  it('no end date: one week to repeat', async () => {
    renderScreen(<HowLongStep />, PATH);
    await userEvent.click(screen.getByRole('radio', { name: 'No end date' }));
    expect(screen.getByText('Ongoing · 3 a day, no end date')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next: rules' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/entry/rules');
  });

  it('a set course shows the finish stamp', () => {
    seed({ medicine: amoxicillin() });
    renderScreen(<HowLongStep />, PATH);
    expect(screen.getByRole('img', { name: 'Course finished' })).toBeInTheDocument();
    expect(screen.getByText('7 days · 21 capsules in all')).toBeInTheDocument();
  });
});
