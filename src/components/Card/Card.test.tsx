import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

describe('Card', () => {
  it('renders as the element asked for, with its content', () => {
    render(
      <Card variant="panel" as="section" className="extra">
        When does it go in?
      </Card>,
    );
    const card = screen.getByText('When does it go in?');
    expect(card.tagName).toBe('SECTION');
    expect(card).toHaveClass('extra');
  });
});
