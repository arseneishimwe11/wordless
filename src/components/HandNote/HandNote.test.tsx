import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HandNote } from './HandNote';

describe('HandNote', () => {
  it('sets its size from the text tokens', () => {
    render(<HandNote size={19}>tap the sky — or drag the sun</HandNote>);
    const note = screen.getByText('tap the sky — or drag the sun');
    expect(note.style.fontSize).toBe('var(--text-19)');
  });
});
