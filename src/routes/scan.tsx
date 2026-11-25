import { copy } from '@/copy/en';
import { PlaceholderScreen } from '@/features/flow/PlaceholderScreen';

import type { Route } from './+types/scan';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.scan.pageTitle }];

/** Scanning a printed sheet arrives in Phase 11. */
export default function Scan() {
  return <PlaceholderScreen title={copy.screens.scan.title} body={copy.screens.scan.soon} />;
}
