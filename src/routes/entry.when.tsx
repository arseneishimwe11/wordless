import { copy } from '@/copy/en';
import { DesktopEntry } from '@/features/desktop/DesktopEntry';
import { WhenStep } from '@/features/sun-arc/WhenStep';
import { requireDraft } from '@/features/flow';
import { useIsDesktop } from '@/lib/useMediaQuery';

import type { Route } from './+types/entry.when';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.when} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

/** The phone screen below 1024px; the desktop split view from there up. */
export default function Entry() {
  return useIsDesktop() ? <DesktopEntry step="when" /> : <WhenStep />;
}
