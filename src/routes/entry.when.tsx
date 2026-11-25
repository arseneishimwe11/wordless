import { copy } from '@/copy/en';
import { WhenStep } from '@/features/sun-arc/WhenStep';
import { requireDraft } from '@/features/flow';

import type { Route } from './+types/entry.when';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.when} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

export default function Entry() {
  return <WhenStep />;
}
