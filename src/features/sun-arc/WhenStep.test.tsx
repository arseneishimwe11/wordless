import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { amoxicillin } from '@/test/fixtures';
import { draft, renderScreen, seed } from '@/test/screens';

import { WhenStep } from './WhenStep';

const PATH = '/entry/when';
const empty = () => amoxicillin({ timing: { mode: 'fixed', doses: [] }, course: { amount: null } });
const stop = (name: RegExp) => screen.getByRole('button', { name });
const sun = () => screen.getByRole('button', { name: /^The sun/ });

describe('WhenStep (the Sun Arc)', () => {
  beforeEach(() => {
    seed({ medicine: empty() });
  });

  it('starts empty, with the hint, and says so', () => {
    renderScreen(<WhenStep />, PATH);
    expect(screen.getByText('No times yet')).toBeInTheDocument();
    expect(screen.getByText('tap the sky — or drag the sun')).toBeInTheDocument();
    expect(screen.getByText('1 capsule each time')).toBeInTheDocument();
  });

  it('tapping a stop adds a dose, and tapping it again removes it', async () => {
    renderScreen(<WhenStep />, PATH);
    await userEvent.click(stop(/^Midday, about 12 noon/));
    expect(draft().medicine.timing.doses).toEqual(['midday']);
    expect(stop(/^Midday/)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Midday')).toBeInTheDocument();
    await userEvent.click(stop(/^Midday/));
    expect(draft().medicine.timing.doses).toEqual([]);
  });

  it('the presets place the doses: 3 a day, every 8 hours', async () => {
    renderScreen(<WhenStep />, PATH);
    const times = screen.getByRole('radiogroup', { name: 'Times a day' });
    await userEvent.click(within(times).getByRole('radio', { name: '3' }));
    expect(screen.getByText('Sunrise, midday and sunset')).toBeInTheDocument();
    expect(
      screen.getByText('1 capsule each time · about 6 am · 12 noon · 6 pm'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Every … h' }));
    expect(screen.getByText('Every 8 h: sunrise, afternoon and night')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '12 h' }));
    expect(draft().medicine.timing).toMatchObject({ mode: 'every', everyHours: 12 });
  });

  it('arrow keys move the sun stop by stop; pressing it adds the dose there', async () => {
    renderScreen(<WhenStep />, PATH);
    expect(sun()).toHaveAccessibleName(/now at sunrise/);
    sun().focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(sun()).toHaveAccessibleName(/now at midday/);
    await userEvent.keyboard('{Enter}');
    expect(draft().medicine.timing.doses).toEqual(['midday']);
    expect(sun()).toHaveAccessibleName(/remove the dose/);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(sun()).toHaveAccessibleName(/now at sunrise/);
  });

  it('dragging the sun and letting go adds a dose where it lands', () => {
    renderScreen(<WhenStep />, PATH);
    // jsdom has no layout: the stage reads as 0 wide, so the pointer is mapped 1:1.
    fireEvent.pointerDown(sun(), { clientX: 46, clientY: 211, pointerId: 1 });
    fireEvent.pointerMove(sun(), { clientX: 343, clientY: 211, pointerId: 1 });
    fireEvent.pointerUp(sun(), { clientX: 343, clientY: 211, pointerId: 1 });
    expect(draft().medicine.timing.doses).toEqual(['sunset']);
  });

  it('when needed: the sky is off, the most a day is counted', async () => {
    renderScreen(<WhenStep />, PATH);
    await userEvent.click(screen.getByRole('radio', { name: 'When needed' }));
    expect(stop(/^Sunrise/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^The sun/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'One more' }));
    expect(screen.getByText('1 capsule at a time, never more than 5 in a day')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No more after the last one' })).toBeInTheDocument();
  });

  it('Next with no times says what is missing; Clear empties the sky', async () => {
    renderScreen(<WhenStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Next: how long' }));
    expect(screen.getByText('Add at least one time first')).toBeInTheDocument();
    await userEvent.click(stop(/^Night/));
    expect(screen.queryByText('Add at least one time first')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(draft().medicine.timing.doses).toEqual([]);
    expect(screen.getByText('No times yet')).toBeInTheDocument();
  });

  it('Next with a time goes on to How long', async () => {
    seed({ medicine: amoxicillin() });
    renderScreen(<WhenStep />, PATH);
    await userEvent.click(screen.getByRole('button', { name: 'Next: how long' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/entry/how-long');
  });
});
