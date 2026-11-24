import { describe, expect, it } from 'vitest';

import { findSvgs, parseElements } from './svg';

describe('findSvgs', () => {
  it('finds each svg with its viewBox and label, in order', () => {
    const html = `<div><svg viewBox="0 0 48 48" aria-label="Sunrise"><path d="M1 1"/></svg>
      <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2 2"/></g></svg></div>`;
    expect(findSvgs(html)).toEqual([
      { viewBox: '0 0 48 48', label: 'Sunrise', inner: '<path d="M1 1"/>' },
      { viewBox: '0 0 24 24', label: null, inner: '<g><path d="M2 2"/></g>' },
    ]);
  });
});

describe('parseElements', () => {
  it('builds a tree of elements and attributes', () => {
    expect(
      parseElements('<g fill="none"><path d="M0 0" stroke-width="2"/><circle r="3"/></g>'),
    ).toEqual([
      {
        tag: 'g',
        attrs: { fill: 'none' },
        children: [
          { tag: 'path', attrs: { d: 'M0 0', 'stroke-width': '2' }, children: [] },
          { tag: 'circle', attrs: { r: '3' }, children: [] },
        ],
      },
    ]);
  });

  it('rejects text, mismatched and unclosed tags', () => {
    expect(() => parseElements('<text>hi</text>')).toThrow(/Unexpected text/);
    expect(() => parseElements('<g></path>')).toThrow(/Mismatched/);
    expect(() => parseElements('<g><path d="M0 0"/>')).toThrow(/Unclosed/);
  });
});
