import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Summary } from './Summary';

describe('Summary', () => {
  it('is announced politely when it changes', () => {
    render(
      <Summary title="No times yet" detail="Tap a time on the sky, or choose how many a day." />,
    );
    expect(screen.getByText('No times yet').parentElement).toHaveAttribute('aria-live', 'polite');
  });
});
