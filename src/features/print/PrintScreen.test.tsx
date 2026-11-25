import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prefsStore } from '@/store';
import { amoxicillin, paracetamol } from '@/test/fixtures';
import { grandmother, renderScreen, seed } from '@/test/screens';

import { PrintScreen } from './PrintScreen';

describe('PrintScreen', () => {
  beforeEach(() => {
    seed({ people: [grandmother([amoxicillin(), paracetamol({ id: 'm2' })])], personId: null });
    prefsStore.setState({ mono: false, output: 'sheet', status: 'ready', loadError: null });
  });

  it('previews the fridge sheet in colour, and prints it', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderScreen(<PrintScreen />, '/print', '/print?person=p1');
    expect(screen.getByRole('heading', { name: 'Print' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Color' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Fridge sheet' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Print the preview again' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });

  it('remembers black and white and the daily strips', async () => {
    renderScreen(<PrintScreen />, '/print', '/print?person=p1');
    await userEvent.click(screen.getByRole('radio', { name: 'Black & white' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Daily strips' }));
    expect(prefsStore.getState()).toMatchObject({ mono: true, output: 'strips' });
    expect(screen.getAllByText('Day 1').length).toBeGreaterThan(0);
  });

  it('goes back to this person’s household', () => {
    renderScreen(<PrintScreen />, '/print', '/print?person=p1');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/household?person=p1',
    );
  });
});
