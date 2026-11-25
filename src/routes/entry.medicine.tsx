import { copy } from '@/copy/en';
import { MedicineStep } from '@/features/pill-builder/MedicineStep';
import { requireDraft } from '@/features/flow';

import type { Route } from './+types/entry.medicine';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.medicine} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

export default function Entry() {
  return <MedicineStep />;
}
