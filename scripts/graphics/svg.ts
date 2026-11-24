/**
 * Minimal SVG reader for the design source files. The boards contain regular,
 * machine-written SVG (no text nodes, CDATA or comments inside drawings), so a
 * small tokenizer is enough and keeps the project free of an XML dependency.
 */

export interface SourceSvg {
  viewBox: string;
  label: string | null;
  /** Everything between <svg …> and </svg>. */
  inner: string;
}

export interface ParsedElement {
  tag: string;
  attrs: Record<string, string>;
  children: ParsedElement[];
}

const SVG_RE = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/g;
const ATTR_RE = /([\w:-]+)="([^"]*)"/g;
const TAG_RE = /<(\/?)([\w:-]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;

function readAttrs(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, name, value] of source.matchAll(ATTR_RE)) {
    if (name !== undefined && value !== undefined) attrs[name] = value;
  }
  return attrs;
}

/** Every top-level <svg> in a board file, in document order. */
export function findSvgs(fileText: string): SourceSvg[] {
  return [...fileText.matchAll(SVG_RE)].map(([, head = '', inner = '']) => {
    const attrs = readAttrs(head);
    return { viewBox: attrs.viewBox ?? '', label: attrs['aria-label'] ?? null, inner };
  });
}

/** Parses SVG child markup into an element tree. Throws on anything unbalanced. */
export function parseElements(markup: string): ParsedElement[] {
  const root: ParsedElement = { tag: '#root', attrs: {}, children: [] };
  const stack: ParsedElement[] = [root];
  let consumed = 0;

  for (const match of markup.matchAll(TAG_RE)) {
    const [whole, closing, tag = '', attrSource = '', selfClosing] = match;
    const between = markup.slice(consumed, match.index);
    if (between.trim()) throw new Error(`Unexpected text in SVG: "${between.trim().slice(0, 40)}"`);
    consumed = match.index + whole.length;

    const parent = stack[stack.length - 1];
    if (!parent) throw new Error('SVG parser lost its parent element');

    if (closing) {
      if (parent.tag !== tag) throw new Error(`Mismatched </${tag}>, expected </${parent.tag}>`);
      stack.pop();
      continue;
    }
    const element: ParsedElement = { tag, attrs: readAttrs(attrSource), children: [] };
    parent.children.push(element);
    if (!selfClosing) stack.push(element);
  }

  const rest = markup.slice(consumed);
  if (rest.trim()) throw new Error(`Unexpected text in SVG: "${rest.trim().slice(0, 40)}"`);
  if (stack.length !== 1) throw new Error(`Unclosed <${stack[stack.length - 1]?.tag ?? '?'}>`);
  return root.children;
}
