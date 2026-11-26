import { copy } from '@/copy/en';
import { DesktopEntry } from '@/features/desktop/DesktopEntry';
import { RulesStep } from '@/features/rules/RulesStep';
import { requireDraft } from '@/features/flow';
import { useIsDesktop } from '@/lib/useMediaQuery';

import type { Route } from './+types/entry.rules';

export const meta: Route.MetaFunction = () => [
  { title: `${copy.screens.steps.rules} · ${copy.app.name}` },
];

export const clientLoader = requireDraft;

/** The phone screen below 1024px; the desktop split view from there up. */
export default function Entry() {
  return useIsDesktop() ? <DesktopEntry step="rules" /> : <RulesStep />;
}
