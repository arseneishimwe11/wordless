import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { NumberField, parseWholeNumber } from './NumberField';

describe('parseWholeNumber', () => {
  it('keeps whole numbers in range, caps at the maximum, and empties anything else', () => {
    expect(parseWholeNumber('7', 1, 90)).toBe(7);
    expect(parseWholeNumber('120', 1, 90)).toBe(90);
    expect(parseWholeNumber('0', 1, 90)).toBeNull();
    expect(parseWholeNumber('', 1, 90)).toBeNull();
    expect(parseWholeNumber('abc', 1, 90)).toBeNull();
  });
});

describe('NumberField', () => {
  function Harness() {
    const [days, setDays] = useState<number | null>(null);
    return (
      <>
        <NumberField
          label="How long, as a number"
          value={days}
          onChange={setDays}
          invalid={days === null}
        />
        <output>{days === null ? 'none' : String(days)}</output>
      </>
    );
  }

  it('shows "?" while empty and is marked as needing an answer', () => {
    render(<Harness />);
    const field = screen.getByRole('spinbutton', { name: 'How long, as a number' });
    expect(field).toHaveAttribute('placeholder', '?');
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });

  it('reports the typed number, capped at the maximum', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const field = screen.getByRole('spinbutton', { name: 'How long, as a number' });
    await user.type(field, '14');
    expect(screen.getByRole('status')).toHaveTextContent('14');
    await user.clear(field);
    await user.type(field, '200');
    expect(screen.getByRole('status')).toHaveTextContent('90');
    expect(field).not.toHaveAttribute('aria-invalid');
  });
});
