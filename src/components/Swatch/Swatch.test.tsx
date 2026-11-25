import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import type { PillColor } from '@/graphics';

import { OptionGroup } from '../OptionGroup';
import { Swatch } from './Swatch';

function Harness() {
  const [color, setColor] = useState<PillColor>('red');
  return (
    <OptionGroup type="radio" label="Color and pattern">
      <Swatch
        color="red"
        label="Red, cross-hatch"
        checked={color === 'red'}
        onChange={() => {
          setColor('red');
        }}
      />
      <Swatch
        color="blue"
        label="Blue, zigzag"
        checked={color === 'blue'}
        onChange={() => {
          setColor('blue');
        }}
      />
    </OptionGroup>
  );
}

describe('Swatch', () => {
  it('names each colour with its pattern, and chooses one', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('radio', { name: 'Red, cross-hatch' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Blue, zigzag' }));
    expect(screen.getByRole('radio', { name: 'Blue, zigzag' })).toBeChecked();
  });
});
