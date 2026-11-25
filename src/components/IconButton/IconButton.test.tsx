import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/render';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('is named by its label, not its drawing', () => {
    render(<IconButton icon="edit" label="Change the medicine" />);
    expect(screen.getByRole('button', { name: 'Change the medicine' })).toBeInTheDocument();
  });

  it('can be a link', () => {
    renderWithRouter(<IconButton icon="back" label="Back" href="/" />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/');
  });
});
