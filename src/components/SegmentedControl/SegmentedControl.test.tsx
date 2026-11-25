import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'fixed', label: 'Times a day' },
  { value: 'every', label: 'Every … h' },
  { value: 'prn', label: 'When needed' },
] as const;

function Harness() {
  const [value, setValue] = useState<'fixed' | 'every' | 'prn'>('fixed');
  return (
    <SegmentedControl
      label="How the prescription gives the time"
      options={OPTIONS}
      value={value}
      onChange={setValue}
    />
  );
}

describe('SegmentedControl', () => {
  it('is a named group of radio buttons', () => {
    render(<Harness />);
    expect(
      screen.getByRole('radiogroup', { name: 'How the prescription gives the time' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Times a day' })).toBeChecked();
  });

  it('changes on click and with the arrow keys, as one tab stop', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('When needed'));
    expect(screen.getByRole('radio', { name: 'When needed' })).toBeChecked();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Every … h' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Every … h' })).toHaveFocus();
  });
});
