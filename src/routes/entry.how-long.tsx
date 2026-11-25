import { copy } from '@/copy/en';
import { HowLongStep } from '@/features/course/HowLongStep';
import { requireDraft } from '@/features/flow';

import type { Route } from './+types/entry.how-long';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.howLong} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

export default function Entry() {
  return <HowLongStep />;
}
