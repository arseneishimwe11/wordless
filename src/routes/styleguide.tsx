import { copy } from '@/copy/en';
import { ColorTypeBoard, TokenReference } from '@/features/styleguide';

import type { Route } from './+types/styleguide';

export const meta: Route.MetaFunction = () => [
  { title: copy.styleguide.pageTitle },
  // Internal reference page: keep it out of search results.
  { name: 'robots', content: 'noindex' },
];

/** Internal design reference: the design system boards rebuilt from tokens. */
export default function Styleguide() {
  return (
    <main>
      <ColorTypeBoard />
      <TokenReference />
    </main>
  );
}
