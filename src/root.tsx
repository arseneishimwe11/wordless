import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import { copy } from '@/copy/en';

import type { Route } from './+types/root';
import './styles/global.css';

export const meta: Route.MetaFunction = () => [
  { title: copy.app.name },
  { name: 'description', content: copy.app.tagline },
];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

/** Shown while the single-page app loads its JavaScript. */
export function HydrateFallback() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main>
      <h1>{notFound ? copy.errors.notFoundTitle : copy.errors.title}</h1>
      <p>{notFound ? copy.errors.notFoundBody : copy.errors.unexpectedBody}</p>
    </main>
  );
}
