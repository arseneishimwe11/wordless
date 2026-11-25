import { RULES, type Rule } from './types';

/** "With food" and "empty stomach" can't both be true: choosing one lifts the other. */
const EXCLUSIVE: Partial<Record<Rule, Rule>> = {
  withFood: 'emptyStomach',
  emptyStomach: 'withFood',
};

/** In the order of {@link RULES}, without repeats. */
export function sortRules(rules: readonly Rule[]): Rule[] {
  return RULES.filter((rule) => rules.includes(rule));
}

export function toggleRule(rules: readonly Rule[], rule: Rule): Rule[] {
  if (rules.includes(rule)) return rules.filter((r) => r !== rule);
  const lifted = EXCLUSIVE[rule];
  return sortRules([...rules.filter((r) => r !== lifted), rule]);
}

/** "Nothing else": no rules. */
export const clearRules = (): Rule[] => [];
