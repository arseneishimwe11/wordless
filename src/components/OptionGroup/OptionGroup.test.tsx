import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OptionGroup, useOptionGroup } from './OptionGroup';

function Probe() {
  const group = useOptionGroup();
  return <span>{group ? `${group.type}:${group.name ? 'named' : 'unnamed'}` : 'none'}</span>;
}

describe('OptionGroup', () => {
  it('is a radio group for one choice and a plain group for many', () => {
    render(
      <>
        <OptionGroup type="radio" label="Form">
          <Probe />
        </OptionGroup>
        <OptionGroup type="checkbox" label="Rules">
          <Probe />
        </OptionGroup>
      </>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Form' })).toHaveTextContent('radio:named');
    expect(screen.getByRole('group', { name: 'Rules' })).toHaveTextContent('checkbox:named');
  });

  it('gives nothing outside a group', () => {
    render(<Probe />);
    expect(screen.getByText('none')).toBeInTheDocument();
  });
});
