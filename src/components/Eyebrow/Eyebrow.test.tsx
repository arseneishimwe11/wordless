import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Eyebrow } from './Eyebrow';

describe('Eyebrow', () => {
  it('keeps its words as written (the capitals are only a style)', () => {
    render(<Eyebrow>For pharmacies, clinics and health workers</Eyebrow>);
    expect(screen.getByText('For pharmacies, clinics and health workers').tagName).toBe('P');
  });
});
