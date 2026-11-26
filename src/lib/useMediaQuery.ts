import { useSyncExternalStore } from 'react';

import { breakpoint } from '@/styles/tokens';

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const PRINT = 'print';

/** What each query last said on screen, to hold on to while the page is printing. */
const onScreen = new Map<string, boolean>();

/**
 * Whether a media query matches now, kept up to date as the window changes. While the
 * page prints, the answer from the screen is kept: printing narrows the page to A4, and
 * the layout (and what was chosen on it) must not change under the printer.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (!canMatch()) return () => undefined;
      const lists = [window.matchMedia(query), window.matchMedia(PRINT)];
      lists.forEach((list) => {
        list.addEventListener('change', onChange);
      });
      return () => {
        lists.forEach((list) => {
          list.removeEventListener('change', onChange);
        });
      };
    },
    () => {
      if (!canMatch()) return false;
      if (window.matchMedia(PRINT).matches) return onScreen.get(query) ?? false;
      const matches = window.matchMedia(query).matches;
      onScreen.set(query, matches);
      return matches;
    },
    () => false,
  );
}

/** The desktop split view from `breakpoint.desktop` (1024px); the phone flow below it. */
export const DESKTOP_QUERY = `(width >= ${String(breakpoint.desktop)}px)`;

export const useIsDesktop = (): boolean => useMediaQuery(DESKTOP_QUERY);
