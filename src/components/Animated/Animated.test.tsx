import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Animated } from './Animated';

describe('Animated', () => {
  it('uses the effect’s keyframes, duration and easing tokens, with a delay', () => {
    const { container } = render(
      <Animated effect="drop" delay={170}>
        <span>pill</span>
      </Animated>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--anim-name')).toBe('wl-drop');
    expect(el.style.getPropertyValue('--anim-duration')).toBe('var(--duration-drop)');
    expect(el.style.getPropertyValue('--anim-ease')).toBe('var(--ease-drop)');
    expect(el.style.getPropertyValue('--anim-delay')).toBe('170ms');
  });

  it('plays again when replay changes, by mounting a fresh element', () => {
    const { container, rerender } = render(
      <Animated effect="nudge" replay={1}>
        <span>field</span>
      </Animated>,
    );
    const first = container.firstElementChild;
    rerender(
      <Animated effect="nudge" replay={1}>
        <span>field</span>
      </Animated>,
    );
    expect(container.firstElementChild).toBe(first);
    rerender(
      <Animated effect="nudge" replay={2}>
        <span>field</span>
      </Animated>,
    );
    expect(container.firstElementChild).not.toBe(first);
  });
});
