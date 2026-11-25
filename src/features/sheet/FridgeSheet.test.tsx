import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Person } from '@/domain';
import { amoxicillin, paracetamol } from '@/test/fixtures';

import { DailyStrips } from './DailyStrips';
import { FridgeSheet } from './FridgeSheet';

const grandmother: Person = {
  id: 'p',
  label: 'Grandmother',
  mark: 'a',
  medicines: [amoxicillin(), paracetamol({ id: 'm2' })],
};
const meta = { preparedBy: 'Pharmacie du Marché', preparedOn: '2026-11-25' };

describe('FridgeSheet', () => {
  it('draws the design’s sheet: times, doses, boxes, legend and code', () => {
    const { container } = render(
      <FridgeSheet person={grandmother} meta={meta} date="25 November 2026" />,
    );
    expect(container.querySelectorAll('section')).toHaveLength(1);
    for (const time of ['Sunrise', 'Midday', 'Sunset', 'Night']) {
      expect(screen.getAllByRole('img', { name: time }).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByRole('img', { name: '1 capsule, with food' })).toHaveLength(3);
    expect(screen.getByText('1 tablet. At most 4 in one day')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'All done when every box is ticked' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The capsules are finished when every box is ticked/),
    ).toBeInTheDocument();
    expect(screen.getByText('a dose to take — tick it')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'QR code holding this whole schedule' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Pharmacie du Marché/)).toHaveTextContent(
      'Prepared by Pharmacie du Marché · 25 November 2026',
    );
    expect(screen.getByRole('img', { name: 'Household mark A' })).toBeInTheDocument();
  });

  it('leaves a line to write on when nobody is named as preparing it', () => {
    render(
      <FridgeSheet
        person={grandmother}
        meta={{ preparedBy: '', preparedOn: null }}
        date="25 November 2026"
      />,
    );
    expect(screen.getByText(/^Prepared by/)).toHaveTextContent('Prepared by · 25 November 2026');
  });

  it('greys everything for a black and white printer', () => {
    const { container } = render(<FridgeSheet person={grandmother} meta={meta} date="d" mono />);
    expect(container.querySelector('section')?.className).toMatch(/mono/);
  });

  it('names each page when a long schedule needs more than one', () => {
    const many = Array.from({ length: 4 }, (_, i) =>
      amoxicillin({ id: `m${String(i)}`, course: { amount: 2, unit: 'weeks' } }),
    );
    render(<FridgeSheet person={{ ...grandmother, medicines: many }} meta={meta} date="d" />);
    // The four rows fill page 1; two grids of boxes fit on each page after it.
    expect(screen.getAllByRole('region').map((page) => page.getAttribute('aria-label'))).toEqual([
      'Page 1 of 3',
      'Page 2 of 3',
      'Page 3 of 3',
    ]);
  });
});

describe('DailyStrips', () => {
  it('prints a strip a day, seven to a page, each with its boxes and the when-needed panel', () => {
    const { container } = render(
      <DailyStrips person={grandmother} meta={meta} date="25 November 2026" />,
    );
    expect(container.querySelectorAll('section')).toHaveLength(1);
    expect(screen.getAllByText(/^Day \d$/)).toHaveLength(7);
    expect(screen.getAllByRole('img', { name: '1 capsule, with food' })).toHaveLength(21);
    expect(screen.getAllByRole('img', { name: 'At most 4 in one day' })).toHaveLength(7);
    const footer = screen.getByText(/Cut along the dashes/).parentElement;
    expect(footer).toHaveTextContent(
      'Amoxicillin 500 mg · Paracetamol · prepared by Pharmacie du Marché · 25 November 2026',
    );
  });

  it('two weeks take two pages; days after a course ends leave it out', () => {
    const twoWeeks = amoxicillin({ course: { amount: 14 } });
    const short = amoxicillin({ id: 'm2', name: 'Short', course: { amount: 3 } });
    const { container } = render(
      <DailyStrips
        person={{ ...grandmother, medicines: [twoWeeks, short] }}
        meta={meta}
        date="d"
      />,
    );
    const pages = [...container.querySelectorAll<HTMLElement>('section')];
    expect(pages).toHaveLength(2);
    const [, page2] = pages;
    if (!page2) throw new Error('no second page');
    const second = within(page2);
    expect(second.getAllByRole('img', { name: '1 capsule, with food' })).toHaveLength(21);
  });
});
