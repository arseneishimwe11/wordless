import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { copy } from '@/copy/en';

import Home from './home';

describe('Home', () => {
  it('renders the page heading and lead', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1, name: copy.home.title })).toBeInTheDocument();
    expect(screen.getByText(copy.home.lead)).toBeInTheDocument();
  });
});
