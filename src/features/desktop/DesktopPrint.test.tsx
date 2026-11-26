import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { prefsStore } from '@/store';
import { amoxicillin, paracetamol } from '@/test/fixtures';
import { grandmother, renderScreen, seed } from '@/test/screens';

import { DesktopPrint } from './DesktopPrint';

/** The pages that print: what `.printOnly` holds. */
const printed = () => document.querySelector('.printOnly');
const sheets = () => printed()?.querySelectorAll('[data-page="sheet"]').length ?? 0;
const strips = () => printed()?.querySelectorAll('[data-page="strips"]').length ?? 0;

describe('DesktopPrint', () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);

  beforeEach(() => {
    seed({ people: [grandmother([amoxicillin(), paracetamol({ id: 'm2' })])], personId: null });
    prefsStore.setState({ mono: false, output: 'sheet', status: 'ready', loadError: null });
    print.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const open = () => renderScreen(<DesktopPrint />, '/print', '/print?person=p1');

  it('names the person and their medicines, and goes back to editing', () => {
    open();
    expect(screen.getByText(/Amoxicillin 500 mg and Paracetamol/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to editing/ })).toHaveAttribute(
      'href',
      '/household?person=p1',
    );
  });

  it('prints the fridge sheet once by default, captioned in colour', async () => {
    open();
    expect(screen.getByRole('radio', { name: /Fridge sheet/ })).toBeChecked();
    expect(screen.getByText('Fridge sheet · A4 · color printer')).toBeInTheDocument();
    expect([sheets(), strips()]).toEqual([1, 0]);
    await userEvent.click(screen.getByRole('button', { name: /Print 1 copy/ }));
    expect(print).toHaveBeenCalledOnce();
  });

  it('prints both, as many copies as asked', async () => {
    open();
    await userEvent.click(screen.getByRole('radio', { name: /Both/ }));
    const copies = screen.getByRole('group', { name: 'Copies' });
    await userEvent.click(within(copies).getByRole('button', { name: 'One more copy' }));
    expect(screen.getByRole('button', { name: /Print 2 copies/ })).toBeInTheDocument();
    expect([sheets(), strips()]).toEqual([2, 2]);
    expect(
      screen.getByText('Fridge sheet and daily strips · A4 · color printer'),
    ).toBeInTheDocument();
    // "Both" is for this print only; the remembered choice stays a single page.
    expect(prefsStore.getState().output).toBe('sheet');
  });

  it('stops at five copies and at one', async () => {
    open();
    const copies = screen.getByRole('group', { name: 'Copies' });
    const more = within(copies).getByRole('button', { name: 'One more copy' });
    for (let i = 0; i < 6; i += 1) await userEvent.click(more);
    expect(screen.getByRole('button', { name: /Print 5 copies/ })).toBeInTheDocument();
    expect(more).toBeDisabled();
    expect(within(copies).getByRole('button', { name: 'One fewer copy' })).toBeEnabled();
  });

  it('remembers the daily strips and black and white', async () => {
    open();
    await userEvent.click(screen.getByRole('radio', { name: /Daily strips/ }));
    await userEvent.click(screen.getByRole('radio', { name: 'Black & white' }));
    expect(prefsStore.getState()).toMatchObject({ output: 'strips', mono: true });
    expect(screen.getByText('Daily strips · A4 · black & white printer')).toBeInTheDocument();
  });

  it('keeps a checklist for handing the sheet over', async () => {
    open();
    const list = screen.getByRole('group', { name: 'At the counter, before it goes home' });
    const boxes = within(list).getAllByRole('checkbox');
    expect(boxes).toHaveLength(3);
    const [, second] = boxes;
    if (!second) throw new Error('no second box');
    await userEvent.click(second);
    expect(boxes.map((b) => (b as HTMLInputElement).checked)).toEqual([false, true, false]);
  });

  it('prints with Enter from outside the controls, not from a control', () => {
    open();
    fireEvent.keyDown(screen.getByRole('heading', { name: 'Print' }), { key: 'Enter' });
    expect(print).toHaveBeenCalledOnce();
    fireEvent.keyDown(screen.getByRole('radio', { name: /Both/ }), { key: 'Enter' });
    expect(print).toHaveBeenCalledOnce();
  });
});
