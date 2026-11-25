import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithRouter } from '@/test/render';

import { Kbd } from '../Kbd';
import { Button } from './Button';

describe('Button', () => {
  it('is a button by default, of type button', () => {
    render(<Button>Next: when</Button>);
    expect(screen.getByRole('button', { name: 'Next: when' })).toHaveAttribute('type', 'button');
  });

  it('is a link when given an href', () => {
    renderWithRouter(<Button href="/when">Next: when</Button>);
    expect(screen.getByRole('link', { name: 'Next: when' })).toHaveAttribute('href', '/when');
  });

  it('keeps a pending button pressable, so it can explain what is missing', async () => {
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        Next: how long
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Next: how long' });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does nothing when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Back
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows keyboard hints as a visual aid, keeping the name to its words', () => {
    const { container } = render(
      <Button iconEnd="arrow" hint={<Kbd>Enter</Kbd>}>
        Continue
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeVisible();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
