import { copy } from '@/copy/en';
import { DesktopEntry } from '@/features/desktop/DesktopEntry';
import { MedicineStep } from '@/features/pill-builder/MedicineStep';
import { requireDraft } from '@/features/flow';
import { useIsDesktop } from '@/lib/useMediaQuery';

import type { Route } from './+types/entry.medicine';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.medicine} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

/** The phone screen below 1024px; the desktop split view from there up. */
export default function Entry() {
  return useIsDesktop() ? <DesktopEntry step="medicine" /> : <MedicineStep />;
}
