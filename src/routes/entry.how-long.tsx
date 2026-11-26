import { copy } from '@/copy/en';
import { DesktopEntry } from '@/features/desktop/DesktopEntry';
import { HowLongStep } from '@/features/course/HowLongStep';
import { requireDraft } from '@/features/flow';
import { useIsDesktop } from '@/lib/useMediaQuery';

import type { Route } from './+types/entry.how-long';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.howLong} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

/** The phone screen below 1024px; the desktop split view from there up. */
export default function Entry() {
  return useIsDesktop() ? <DesktopEntry step="howLong" /> : <HowLongStep />;
}
