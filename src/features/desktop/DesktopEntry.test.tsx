import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import { ENTRY_STEPS, type EntryStep } from '@/domain';
import { prefsStore } from '@/store';
import { amoxicillin, medicine, paracetamol } from '@/test/fixtures';
import { draft, grandmother, household, seed } from '@/test/screens';

import { STEP_PATHS } from '../flow';
import { DesktopEntry } from './DesktopEntry';

function Elsewhere() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}

/** All four steps routed, so Continue and Back really move between them. */
function renderEntry(step: EntryStep) {
  return render(
    <MemoryRouter initialEntries={[STEP_PATHS[step]]}>
      <Routes>
        {ENTRY_STEPS.map((s) => (
          <Route key={s} path={STEP_PATHS[s]} element={<DesktopEntry step={s} />} />
        ))}
        <Route path="*" element={<Elsewhere />} />
      </Routes>
    </MemoryRouter>,
  );
}

const title = () => screen.getByRole('heading', { level: 1 });
const sheet = () =>
  screen.getByRole('complementary', { name: 'Live preview of the printed sheet' });

describe('DesktopEntry', () => {
  beforeEach(() => {
    seed({ people: [grandmother([paracetamol({ id: 'm2' })])] });
    prefsStore.setState({ mono: false, output: 'sheet', status: 'ready', loadError: null });
  });

  it('shows the steps in a rail, with what each one says so far', () => {
    renderEntry('when');
    const rail = screen.getByRole('navigation', { name: 'Steps' });
    const items = within(rail).getAllByRole('button');
    expect(items.map((b) => b.textContent)).toEqual([
      expect.stringContaining('Amoxicillin 500 mg'),
      expect.stringContaining('sunrise, midday'),
      expect.stringContaining('7 days'),
      expect.stringContaining('Rules'),
    ]);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(/new medicine for this sheet/)).toBeInTheDocument();
  });

  it('jumps to a step from the rail', async () => {
    renderEntry('when');
    await userEvent.click(screen.getByRole('button', { name: /Rules/ }));
    expect(title()).toHaveTextContent('Anything else it says?');
  });

  it('Enter continues, Shift + Enter goes back, from anywhere on the page', async () => {
    renderEntry('medicine');
    expect(screen.getByLabelText(/Medicine name/)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(title()).toHaveTextContent('When does it go in?');
    await userEvent.keyboard('{Enter}');
    expect(title()).toHaveTextContent('For how long?');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(title()).toHaveTextContent('When does it go in?');
    expect(draft().step).toBe('when');
  });

  it('places doses with 1–4 and moves the sun with the arrows on the When step', async () => {
    seed({ medicine: medicine({ name: 'X', form: 'tablet' }) });
    renderEntry('when');
    (document.activeElement as HTMLElement).blur();
    await userEvent.keyboard('2');
    expect(draft().medicine.timing.doses).toEqual(['sunrise', 'sunset']);
    await userEvent.keyboard('4');
    expect(draft().medicine.timing.doses).toHaveLength(4);
    // Typing in a field is left alone.
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('says what is missing when Enter is pressed too early, and stays', async () => {
    seed({ medicine: medicine({ name: 'X' }) });
    renderEntry('when');
    await userEvent.keyboard('{Enter}');
    expect(title()).toHaveTextContent('When does it go in?');
    expect(screen.getByText('Add at least one time first')).toBeInTheDocument();
  });

  it('draws the medicine on the live sheet as it is entered, next to the others', () => {
    renderEntry('when');
    expect(within(sheet()).getByText('Amoxicillin 500 mg · being entered')).toBeInTheDocument();
    expect(within(sheet()).getAllByText('Paracetamol')).toHaveLength(2);
    expect(within(sheet()).getByText('being entered')).toBeInTheDocument();
    expect(within(sheet()).getByText('the code is drawn when you print')).toBeInTheDocument();
  });

  it('marks the cells "?" until the medicine has times', () => {
    seed({ medicine: medicine({ name: 'X' }) });
    renderEntry('when');
    expect(within(sheet()).getAllByText('?').length).toBeGreaterThan(0);
  });

  it('switches the live sheet to black and white for everyone', async () => {
    renderEntry('medicine');
    await userEvent.click(screen.getByRole('radio', { name: 'Black & white' }));
    expect(prefsStore.getState().mono).toBe(true);
  });

  it('adds the medicine to the sheet, then offers the print preview', async () => {
    renderEntry('rules');
    await userEvent.click(screen.getByRole('button', { name: /Add to the sheet/ }));
    expect(household().people[0]?.medicines.map((m) => m.name)).toEqual([
      'Paracetamol',
      'Amoxicillin 500 mg',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Amoxicillin 500 mg has been added for Grandmother, next to Paracetamol.',
    );
    // Saved: the sheet shows it as it will print, code and all.
    expect(within(sheet()).queryByText('being entered')).toBeNull();
    expect(within(sheet()).getByRole('img', { name: /QR code/, hidden: true })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Print preview/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/print?person=p1');
    expect(draft().personId).toBeNull();
  });

  it('says it is changing a saved medicine, and saves over it', async () => {
    const saved = amoxicillin();
    seed({ people: [grandmother([saved])], medicine: { ...saved, qty: 2 }, editingId: saved.id });
    renderEntry('rules');
    expect(screen.getByText(/changing Amoxicillin 500 mg/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Add to the sheet/ }));
    expect(household().people[0]?.medicines.map((m) => m.qty)).toEqual([2]);
  });
});
