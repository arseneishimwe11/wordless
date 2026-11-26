import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DESKTOP_QUERY, useMediaQuery } from './useMediaQuery';

function Probe({ query }: { query: string }) {
  return <p>{useMediaQuery(query) ? 'yes' : 'no'}</p>;
}

/** A matchMedia whose answer (and whether the page is printing) the test can flip. */
function fakeMatchMedia(initial: boolean) {
  const state = { matches: initial, printing: false };
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === 'print' ? state.printing : state.matches;
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
  return (next: Partial<typeof state>) => {
    Object.assign(state, next);
    listeners.forEach((cb) => {
      cb();
    });
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows the query as the window changes', () => {
    const set = fakeMatchMedia(false);
    render(<Probe query={DESKTOP_QUERY} />);
    expect(screen.getByText('no')).toBeInTheDocument();
    act(() => {
      set({ matches: true });
    });
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('keeps the screen’s answer while printing narrows the page', () => {
    const set = fakeMatchMedia(true);
    render(<Probe query={DESKTOP_QUERY} />);
    act(() => {
      set({ printing: true });
    });
    act(() => {
      set({ matches: false });
    });
    expect(screen.getByText('yes')).toBeInTheDocument();
    act(() => {
      set({ printing: false });
    });
    expect(screen.getByText('no')).toBeInTheDocument();
  });

  it('is false where the browser can’t tell (tests, the server)', () => {
    render(<Probe query="(width >= 1024px)" />);
    expect(screen.getByText('no')).toBeInTheDocument();
  });

  it('uses the desktop breakpoint', () => {
    expect(DESKTOP_QUERY).toBe('(width >= 1024px)');
  });
});
