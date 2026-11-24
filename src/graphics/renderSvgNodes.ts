import { createElement, type CSSProperties, type ReactNode } from 'react';

import type { SlotValues, SvgNode } from './types';

const PAINT = new Set(['fill', 'stroke']);

/** Resolves an encoded paint or slot value (see types.ts) to something CSS understands. */
export function resolveValue(value: string, slots: SlotValues): string | undefined {
  if (value.startsWith('s:')) return slots[value.slice(2) as keyof SlotValues];
  if (value.startsWith('c:')) return `var(--color-${value.slice(2)})`;
  if (value.startsWith('p:')) return `url(#wl-p-${value.slice(2)})`;
  return value;
}

/**
 * Renders generated drawing data as React SVG elements. Paint goes into `style`
 * because presentation attributes cannot hold `var()` in every browser.
 */
export function renderSvgNodes(nodes: readonly SvgNode[], slots: SlotValues = {}): ReactNode[] {
  return nodes.map(([tag, attrs, children], index) => {
    const props: Record<string, unknown> = { key: index };
    const style: CSSProperties = {};
    for (const [name, raw] of Object.entries(attrs)) {
      const value = resolveValue(raw, slots);
      if (value === undefined) continue;
      if (PAINT.has(name)) style[name as 'fill' | 'stroke'] = value;
      else props[name] = value;
    }
    if (Object.keys(style).length) props.style = style;
    return createElement(tag, props, children ? renderSvgNodes(children, slots) : undefined);
  });
}
