import { describe, expect, it } from 'vitest';

import { isDevice, isSmallUnit, pillUnits } from './pillUnits';

describe('pillUnits', () => {
  it('draws whole tablets, then a half', () => {
    expect(pillUnits('tablet', 1)).toEqual(['tablet']);
    expect(pillUnits('tablet', 0.5)).toEqual(['half']);
    expect(pillUnits('tablet', 1.5)).toEqual(['tablet', 'half']);
    expect(pillUnits('tablet', 2.5)).toEqual(['tablet', 'tablet', 'half']);
    expect(pillUnits('oval', 2)).toEqual(['oval', 'oval']);
  });

  it('draws one capsule per capsule', () => {
    expect(pillUnits('capsule', 3)).toEqual(['capsule', 'capsule', 'capsule']);
  });

  it('measures liquid in 5 ml spoons, with a half spoon for 2.5 ml', () => {
    expect(pillUnits('liquid', 5)).toEqual(['spoon']);
    expect(pillUnits('liquid', 2.5)).toEqual(['spoon-half']);
    expect(pillUnits('liquid', 7.5)).toEqual(['spoon', 'spoon-half']);
    expect(pillUnits('liquid', 20)).toEqual(['spoon', 'spoon', 'spoon', 'spoon']);
  });

  it('draws the dropper, then one drop each', () => {
    expect(pillUnits('drops', 2)).toEqual(['dropper', 'drop', 'drop']);
  });

  it('draws the inhaler, then one puff each', () => {
    expect(pillUnits('inhaler', 2)).toEqual(['inhaler', 'puff', 'puff']);
  });

  it('classifies small units and devices', () => {
    expect(isSmallUnit('drop')).toBe(true);
    expect(isSmallUnit('puff')).toBe(true);
    expect(isSmallUnit('capsule')).toBe(false);
    expect(isDevice('dropper')).toBe(true);
    expect(isDevice('inhaler')).toBe(true);
    expect(isDevice('spoon')).toBe(false);
  });
});
