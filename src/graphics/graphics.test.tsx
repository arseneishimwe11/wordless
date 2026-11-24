import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { glyphs } from './generated/glyphs';
import { patterns } from './generated/patterns';
import { pillShapes } from './generated/pillShapes';
import { Glyph } from './Glyph';
import { PatternDefs } from './PatternDefs';
import { PILL_COLORS, PILL_PATTERN, pillSlots } from './pillColors';
import { PillStack } from './PillStack';
import { PillUnit } from './PillUnit';
import { resolveValue } from './renderSvgNodes';

describe('Glyph', () => {
  it('is an image with a name when labelled', () => {
    render(<Glyph name="sunrise" label="Sunrise" size={40} />);
    const img = screen.getByRole('img', { name: 'Sunrise' });
    expect(img).toHaveAttribute('width', '40');
    expect(img).toHaveAttribute('viewBox', '0 0 48 48');
  });

  it('is hidden from assistive technology when decorative', () => {
    const { container } = render(<Glyph name="sunrise" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('paints with colour tokens, never raw values', () => {
    const { container } = render(<Glyph name="sunrise" />);
    const painted = [...container.querySelectorAll<SVGElement>('[style]')].map(
      (el) => el.style.cssText,
    );
    expect(painted.join(';')).toContain('var(--color-ink)');
    expect(painted.join(';')).not.toMatch(/#[0-9a-f]{6}/i);
  });
});

describe('resolveValue', () => {
  it('turns encoded values into CSS', () => {
    expect(resolveValue('c:night-tint', {})).toBe('var(--color-night-tint)');
    expect(resolveValue('p:dots', {})).toBe('url(#wl-p-dots)');
    expect(resolveValue('s:base', { base: 'red' })).toBe('red');
    expect(resolveValue('s:base', {})).toBeUndefined();
    expect(resolveValue('none', {})).toBe('none');
  });
});

describe('pill colours', () => {
  it.each(PILL_COLORS)('%s fills with its token and its own pattern', (c) => {
    const slots = pillSlots(c);
    expect(slots.base).toBe(`var(--color-pill-${c})`);
    const pattern = PILL_PATTERN[c];
    expect(slots.pattern).toBe(pattern ? `url(#wl-p-${pattern})` : 'none');
    if (pattern) expect(patterns).toHaveProperty(pattern);
  });

  it('gives every colour a different pattern, so none relies on colour alone', () => {
    const used = PILL_COLORS.map((c) => PILL_PATTERN[c]);
    expect(new Set(used).size).toBe(used.length);
  });

  it('colours a capsule cap and body separately, and switches the score line', () => {
    const slots = pillSlots('red', 'yellow', true);
    expect(slots).toMatchObject({
      base: 'var(--color-pill-red)',
      base2: 'var(--color-pill-yellow)',
      pattern2: 'url(#wl-p-dots)',
      score: '1',
    });
    expect(pillSlots('white').score).toBe('0');
  });
});

describe('PillUnit', () => {
  it('fills the drawing’s slots with the chosen colours', () => {
    const { container } = render(<PillUnit kind="capsule" color="red" color2="yellow" />);
    // jsdom writes url("#id"); browsers accept either form.
    const fills = [...container.querySelectorAll<SVGElement>('[style]')].map((el) =>
      el.style.fill.replaceAll('"', ''),
    );
    expect(fills).toContain('var(--color-pill-red)');
    expect(fills).toContain('var(--color-pill-yellow)');
    expect(fills).toContain('url(#wl-p-cross)');
  });

  it('has a drawing for every unit kind', () => {
    for (const kind of [
      'tablet',
      'oval',
      'half',
      'capsule',
      'spoon',
      'spoon-half',
      'dropper',
      'drop',
      'inhaler',
      'puff',
    ] as const) {
      expect(pillShapes).toHaveProperty(kind);
    }
  });
});

describe('PillStack', () => {
  it('draws a dose unit by unit, with the design’s sizes for the context', () => {
    const { container } = render(
      <PillStack form="drops" qty={2} color="orange" context="builder" />,
    );
    const widths = [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('width'));
    expect(widths).toEqual(['108', '34', '34']);
  });

  it('shrinks main units as more are drawn', () => {
    const one = render(<PillStack form="tablet" qty={1} color="white" context="sheet" />);
    expect(one.container.querySelector('svg')).toHaveAttribute('width', '60');
    const three = render(<PillStack form="tablet" qty={3} color="white" context="sheet" />);
    expect(three.container.querySelector('svg')).toHaveAttribute('width', '38');
  });

  it('can be named as a whole for screen readers', () => {
    render(
      <PillStack form="tablet" qty={1.5} color="white" context="sheet" label="1½ tablets, white" />,
    );
    expect(screen.getByRole('img', { name: '1½ tablets, white' })).toBeInTheDocument();
  });
});

describe('PatternDefs', () => {
  it('defines every pattern once, with the ids pills refer to', () => {
    const { container } = render(<PatternDefs />);
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(ids.sort()).toEqual(
      Object.keys(patterns)
        .map((n) => `wl-p-${n}`)
        .sort(),
    );
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('glyph set', () => {
  it('covers the 21 marks of the Pictograms board', () => {
    const marks = [
      'sunrise',
      'mid-morning',
      'midday',
      'afternoon',
      'sunset',
      'night',
      'when-needed',
      'with-food',
      'empty-stomach',
      'with-water',
      'no-alcohol',
      'sleepiness',
      'keep-cool',
      'shake-first',
      'take-it',
      'taken',
      'if-needed',
      'no-more',
      'course-done',
      'patient',
      'tick-each-time',
    ];
    for (const mark of marks) expect(glyphs).toHaveProperty(mark);
  });
});
