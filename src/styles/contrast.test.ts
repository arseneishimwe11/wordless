import { describe, expect, it } from 'vitest';

import { AA_MINIMUM, contrastRatio, relativeLuminance } from './contrast';
import { color, textPairs } from './tokens';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio(color.ink, color.paper)).toBe(contrastRatio(color.paper, color.ink));
  });

  it('rejects colours it cannot measure', () => {
    expect(() => relativeLuminance('rgba(0,0,0,0.5)')).toThrow();
  });
});

describe('design text pairs meet WCAG AA', () => {
  it.each(textPairs)('$fg on $bg ($where)', ({ fg, bg, size }) => {
    expect(contrastRatio(color[fg], color[bg])).toBeGreaterThanOrEqual(AA_MINIMUM[size]);
  });

  it('keeps the sunset ink out of text: it fails AA on paper', () => {
    // Why `error` exists: the design used sunset (#B4502E) for error text, which measures 4.41:1.
    expect(contrastRatio(color.sunset, color.paper)).toBeLessThan(AA_MINIMUM.normal);
  });
});
