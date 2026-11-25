import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StepRail, StepRailItem } from './StepRail';

describe('StepRail', () => {
  it('marks the current step and says when a step is done', async () => {
    const onSelect = vi.fn();
    render(
      <StepRail label="Steps">
        <StepRailItem
          number={1}
          title="Medicine"
          summary="Amoxicillin 500 mg"
          done
          doneLabel="done"
          onSelect={onSelect}
        />
        <StepRailItem
          number={2}
          title="When"
          summary="—"
          current
          doneLabel="done"
          onSelect={vi.fn()}
        />
      </StepRail>,
    );
    expect(screen.getByRole('navigation', { name: 'Steps' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /When/ })).toHaveAttribute('aria-current', 'step');
    const medicine = screen.getByRole('button', { name: /Medicine, done/ });
    expect(medicine).not.toHaveAttribute('aria-current');
    await userEvent.click(medicine);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
