import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/render';

import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('is one link named by its title and details', () => {
    renderWithRouter(
      <ListRow
        href="/medicine"
        title="Paracetamol"
        subtitle="only when needed · at most 4 a day"
      />,
    );
    expect(
      screen.getByRole('link', { name: 'Paracetamol only when needed · at most 4 a day' }),
    ).toHaveAttribute('href', '/medicine');
  });
});
