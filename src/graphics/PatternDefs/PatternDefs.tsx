import { patterns, type PatternName } from '../generated/patterns';
import { renderSvgNodes } from '../renderSvgNodes';
import type { SvgNode } from '../types';

export const patternId = (name: PatternName) => `wl-p-${name}`;

/**
 * The fill patterns every pill colour is paired with. Render once per document
 * (the app root does this); pills refer to them as url(#wl-p-…).
 */
export function PatternDefs() {
  const nodes = Object.entries(patterns).map(
    ([
      name,
      {
        nodes: [pattern],
      },
    ]): SvgNode => {
      if (!pattern) throw new Error(`Pattern ${name} has no drawing`);
      const [tag, attrs, children] = pattern;
      return [tag, { ...attrs, id: patternId(name as PatternName) }, children];
    },
  );
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>{renderSvgNodes(nodes)}</defs>
    </svg>
  );
}
