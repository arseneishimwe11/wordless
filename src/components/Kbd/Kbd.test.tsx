import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('marks up a key as a key', () => {
    render(<Kbd>Enter</Kbd>);
    expect(screen.getByText('Enter').tagName).toBe('KBD');
  });
});
