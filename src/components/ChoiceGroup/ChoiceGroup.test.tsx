import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { ChoiceGroup } from './ChoiceGroup';

function Harness() {
  const [value, setValue] = useState<number | 'ongoing' | null>(null);
  return (
    <ChoiceGroup
      label="Usual lengths"
      chip="number"
      options={[
        { value: 5, label: '5' },
        { value: 7, label: '7' },
        { value: 'ongoing', label: 'No end date', chip: 'text', wide: true },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

describe('ChoiceGroup', () => {
  it('starts with nothing chosen when the value is null', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Usual lengths' })).toBeInTheDocument();
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });

  it('chooses one chip at a time', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('7'));
    expect(screen.getByRole('radio', { name: '7' })).toBeChecked();
    await user.click(screen.getByText('No end date'));
    expect(screen.getByRole('radio', { name: 'No end date' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '7' })).not.toBeChecked();
  });
});
