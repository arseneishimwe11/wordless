import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { OptionGroup } from '../OptionGroup';
import { ToggleCard } from './ToggleCard';

function Rules() {
  const [rules, setRules] = useState<string[]>(['food']);
  const toggle = (rule: string) => (on: boolean) => {
    setRules((current) => (on ? [...current, rule] : current.filter((r) => r !== rule)));
  };
  return (
    <OptionGroup type="checkbox" label="Rules">
      <ToggleCard
        layout="stack"
        stamp
        title="With food"
        checked={rules.includes('food')}
        onChange={toggle('food')}
      />
      <ToggleCard
        layout="stack"
        stamp
        title="With water"
        checked={rules.includes('water')}
        onChange={toggle('water')}
      />
    </OptionGroup>
  );
}

function Forms() {
  const [form, setForm] = useState('tablet');
  return (
    <OptionGroup type="radio" label="Form">
      {['tablet', 'capsule'].map((f) => (
        <ToggleCard
          key={f}
          layout="row"
          title={f}
          value={f}
          checked={form === f}
          onChange={() => {
            setForm(f);
          }}
        />
      ))}
    </OptionGroup>
  );
}

describe('ToggleCard', () => {
  it('works as checkboxes inside a checkbox group, any number at once', async () => {
    const user = userEvent.setup();
    render(<Rules />);
    expect(screen.getByRole('group', { name: 'Rules' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'With food' })).toBeChecked();
    await user.click(screen.getByText('With water'));
    expect(screen.getByRole('checkbox', { name: 'With water' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'With food' })).toBeChecked();
    await user.click(screen.getByText('With food'));
    expect(screen.getByRole('checkbox', { name: 'With food' })).not.toBeChecked();
  });

  it('lands a decorative stamp only on chosen rule cards', () => {
    const { container } = render(<Rules />);
    const stamps = container.querySelectorAll('[aria-hidden="true"] svg');
    expect(stamps).toHaveLength(1);
  });

  it('works as radios inside a radio group, sharing one name', async () => {
    const user = userEvent.setup();
    render(<Forms />);
    const [tablet, capsule] = screen.getAllByRole('radio');
    expect(tablet).toHaveAttribute('name', capsule?.getAttribute('name') ?? 'missing');
    await user.click(screen.getByText('capsule'));
    expect(capsule).toBeChecked();
    expect(tablet).not.toBeChecked();
  });
});
