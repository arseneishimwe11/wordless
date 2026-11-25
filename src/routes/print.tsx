import { copy } from '@/copy/en';
import { requireHousehold } from '@/features/flow';
import { PrintScreen } from '@/features/print/PrintScreen';

import type { Route } from './+types/print';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.print.pageTitle }];

export const clientLoader = requireHousehold;

export default function Print() {
  return <PrintScreen />;
}
