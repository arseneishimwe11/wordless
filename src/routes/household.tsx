import { copy } from '@/copy/en';
import { requireHousehold } from '@/features/flow';
import { HouseholdScreen } from '@/features/household/HouseholdScreen';

import type { Route } from './+types/household';

export const meta: Route.MetaFunction = () => [{ title: copy.screens.household.pageTitle }];

export const clientLoader = requireHousehold;

export default function Household() {
  return <HouseholdScreen />;
}
