// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { display, DISPLAY_SCALE, text } from './tokens';
import { renderTokensCss, tokenDeclarations } from './tokensCss';

describe('design tokens', () => {
  it('tokens.css is up to date with tokens.ts (run `npm run tokens`)', () => {
    const committed = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    expect(committed).toBe(renderTokensCss());
  });

  it('gives every token a unique CSS name', () => {
    const names = tokenDeclarations().map(([name]) => name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('draws display type at 92% of the authored size', () => {
    expect(DISPLAY_SCALE).toBe(0.92);
    expect(display['26']).toBe('23.92px');
    expect(display['31']).toBe('28.52px');
    expect(display['64']).toBe('58.88px');
  });

  it('keeps body and landing sizes exactly as designed', () => {
    expect(text['17']).toBe('17px');
    expect(text['76']).toBe('76px');
  });

  it('only refers to other tokens, never to per-element variables', () => {
    // Custom properties on :root resolve on :root. A token such as `var(--dose-color)`
    // would silently ignore the element's own value, so tokens may only reference tokens.
    const names = new Set(tokenDeclarations().map(([name]) => name));
    const unknown = tokenDeclarations().flatMap(([name, value]) =>
      [...value.matchAll(/var\((--[\w-]+)/g)]
        .map((m) => m[1] ?? '')
        .filter((ref) => !names.has(ref))
        .map((ref) => `${name} → ${ref}`),
    );
    expect(unknown).toEqual([]);
  });

  it('renders declarations as --group-key', () => {
    expect(tokenDeclarations({ color: { ink: '#000' } })).toEqual([['--color-ink', '#000']]);
  });
});
