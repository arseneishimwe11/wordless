import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StepProgress } from './StepProgress';

describe('StepProgress', () => {
  it('says where you are in words; the segments are decoration', () => {
    const { container } = render(<StepProgress current={2} total={4} label="When · step 2 of 4" />);
    expect(screen.getByText('When · step 2 of 4')).toBeInTheDocument();
    const segments = container.querySelector('[aria-hidden="true"]');
    expect(segments?.children).toHaveLength(4);
  });
});
