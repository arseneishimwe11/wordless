import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/start.tsx'),
  route('household', 'routes/household.tsx'),
  route('entry/medicine', 'routes/entry.medicine.tsx'),
  route('entry/when', 'routes/entry.when.tsx'),
  route('entry/how-long', 'routes/entry.how-long.tsx'),
  route('entry/rules', 'routes/entry.rules.tsx'),
  route('print', 'routes/print.tsx'),
  route('scan', 'routes/scan.tsx'),
  route('styleguide', 'routes/styleguide.tsx'),
] satisfies RouteConfig;
