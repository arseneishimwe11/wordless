import type { Rule } from '@/domain';

/** The pictogram for each rule. */
export const RULE_GLYPH = {
  withFood: 'with-food',
  emptyStomach: 'empty-stomach',
  withWater: 'with-water',
  noAlcohol: 'no-alcohol',
  sleepiness: 'sleepiness',
  keepCool: 'keep-cool',
  shakeFirst: 'shake-first',
} as const satisfies Record<Rule, string>;
