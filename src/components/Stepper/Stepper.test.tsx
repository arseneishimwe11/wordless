import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Stepper } from './Stepper';

const TABLET_STEPS = [0.5, 1, 1.5, 2] as const;
const fraction = (q: number) => ({
  value: `${Math.floor(q) ? String(Math.floor(q)) : ''}${q % 1 ? '½' : ''}`,
  unit: q > 1 ? 'tablets' : 'tablet',
});

function Harness({ start }: { start: number }) {
  const [qty, setQty] = useState(start);
  return (
    <Stepper
      label="Each time"
      value={qty}
      onChange={setQty}
      steps={TABLET_STEPS}
      format={fraction}
      decreaseLabel="Less"
      increaseLabel="More"
    />
  );
}

describe('Stepper', () => {
  it('steps through the allowed values and shows them as written', async () => {
    const user = userEvent.setup();
    render(<Harness start={1} />);
    expect(screen.getByRole('group', { name: 'Each time' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('status')).toHaveTextContent('1½tablets');
  });

  it('disables each end', async () => {
    const user = userEvent.setup();
    render(<Harness start={0.5} />);
    expect(screen.getByRole('button', { name: 'Less' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('button', { name: 'More' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('2tablets');
  });

  it('can count over a range instead of a list', async () => {
    function Range() {
      const [n, setN] = useState(4);
      return (
        <Stepper
          label="At most"
          value={n}
          onChange={setN}
          min={1}
          max={6}
          decreaseLabel="One fewer"
          increaseLabel="One more"
        />
      );
    }
    const user = userEvent.setup();
    render(<Range />);
    await user.click(screen.getByRole('button', { name: 'One more' }));
    await user.click(screen.getByRole('button', { name: 'One more' }));
    expect(screen.getByRole('status')).toHaveTextContent('6');
    expect(screen.getByRole('button', { name: 'One more' })).toBeDisabled();
  });
});
