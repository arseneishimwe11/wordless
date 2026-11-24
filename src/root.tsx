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

// Fonts are bundled with the app (never a font CDN) so Wordless works offline.
import bodyFontUrl from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource/young-serif/400.css';
import '@fontsource/kalam/400.css';
// Order matters: tokens before anything that reads them.
import './styles/tokens.css';
import './styles/global.css';
import './styles/motion.css';
import './styles/print.css';

export const meta: Route.MetaFunction = () => [
  { title: copy.app.name },
  { name: 'description', content: copy.app.tagline },
];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'preload', href: bodyFontUrl, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
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
