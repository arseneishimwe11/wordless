import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles from its label, in both looks', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="Point at each sun: this is when." />
        <Checkbox variant="pill" label="Score line" />
      </>,
    );
    await user.click(screen.getByText('Point at each sun: this is when.'));
    expect(
      screen.getByRole('checkbox', { name: 'Point at each sun: this is when.' }),
    ).toBeChecked();
    await user.click(screen.getByText('Score line'));
    expect(screen.getByRole('checkbox', { name: 'Score line' })).toBeChecked();
  });
});
