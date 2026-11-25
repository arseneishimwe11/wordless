import { copy } from '@/copy/en';
import { RulesStep } from '@/features/rules/RulesStep';
import { requireDraft } from '@/features/flow';

import type { Route } from './+types/entry.rules';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.rules} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

export default function Entry() {
  return <RulesStep />;
}
