import { copy } from '@/copy/en';
import { StartScreen } from '@/features/start/StartScreen';
import { loadStores } from '@/store';

import type { Route } from './+types/start';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.start.pageTitle }];

export async function clientLoader() {
  await loadStores();
  return null;
}

export default function Start() {
  return <StartScreen />;
}
