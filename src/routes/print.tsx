import { copy } from '@/copy/en';
import { PlaceholderScreen } from '@/features/flow/PlaceholderScreen';

import type { Route } from './+types/print';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.print.pageTitle }];

/** The Print screen arrives with the printable sheets in Phase 7. */
export default function Print() {
  return <PlaceholderScreen title={copy.screens.print.title} body={copy.screens.print.soon} />;
}
