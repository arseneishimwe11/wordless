import { copy } from '@/copy/en';
import { DesktopPrint } from '@/features/desktop/DesktopPrint';
import { requireHousehold } from '@/features/flow';
import { PrintScreen } from '@/features/print/PrintScreen';
import { useIsDesktop } from '@/lib/useMediaQuery';

import type { Route } from './+types/print';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.print.pageTitle }];

export const clientLoader = requireHousehold;

/** The phone Print screen below 1024px; the desktop print page from there up. */
export default function Print() {
  return useIsDesktop() ? <DesktopPrint /> : <PrintScreen />;
}
