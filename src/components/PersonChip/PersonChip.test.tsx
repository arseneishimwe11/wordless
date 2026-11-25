import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { OptionGroup } from '../OptionGroup';
import { PersonChip } from './PersonChip';

function Harness() {
  const [who, setWho] = useState<'a' | 'b'>('a');
  return (
    <OptionGroup type="radio" label="Who">
      <PersonChip
        mark="a"
        name="Grandmother"
        checked={who === 'a'}
        onChange={() => {
          setWho('a');
        }}
      />
      <PersonChip
        mark="b"
        name="Child"
        checked={who === 'b'}
        onChange={() => {
          setWho('b');
        }}
      />
    </OptionGroup>
  );
}

describe('PersonChip', () => {
  it('chooses one person in the household', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('radio', { name: 'Grandmother' })).toBeChecked();
    await user.click(screen.getByText('Child'));
    expect(screen.getByRole('radio', { name: 'Child' })).toBeChecked();
  });
});
