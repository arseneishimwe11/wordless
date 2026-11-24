/**
 * Turns design SVG into the app's GraphicData: React prop names, colours as token
 * references, pill template placeholders as named slots. Anything it cannot map
 * (an unknown colour, tag or placeholder) is an error, so nothing raw slips through.
 */
import {
  SVG_TAGS,
  type GraphicData,
  type PillSlot,
  type SvgNode,
  type SvgTag,
} from '../../src/graphics/types.ts';
import { color } from '../../src/styles/tokens.ts';

import type { ManifestEntry } from './manifest.ts';
import { findSvgs, parseElements, type ParsedElement, type SourceSvg } from './svg.ts';

const PAINT_ATTRS = new Set(['fill', 'stroke']);

/** Design placeholder name → slot. Prefixes (`u.`, `m.`) differ by board; the field is what matters. */
const TEMPLATE_SLOTS: Record<string, PillSlot> = {
  base: 'base',
  pat: 'pattern',
  base2: 'base2',
  pat2: 'pattern2',
  scoreOp: 'score',
};

/** hex (upper case) → token name. The first token with a value wins (e.g. white, not pill-white). */
const HEX_TO_TOKEN = new Map<string, string>();
for (const [name, value] of Object.entries(color)) {
  if (value.startsWith('#') && !HEX_TO_TOKEN.has(value.toUpperCase())) {
    HEX_TO_TOKEN.set(value.toUpperCase(), name);
  }
}

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function isSvgTag(tag: string): tag is SvgTag {
  return (SVG_TAGS as readonly string[]).includes(tag);
}

function encodeValue(attr: string, raw: string, where: string): string {
  const template = /^\{\{\s*\w+\.(\w+)\s*\}\}$/.exec(raw);
  if (template) {
    const slot = TEMPLATE_SLOTS[template[1] ?? ''];
    if (!slot) throw new Error(`${where}: unknown placeholder ${raw}`);
    return `s:${slot}`;
  }
  if (raw.includes('{{')) throw new Error(`${where}: placeholder inside a value: ${raw}`);

  if (!PAINT_ATTRS.has(attr)) return raw;
  if (raw === 'none' || raw === 'currentColor') return raw;
  const pattern = /^url\(#wl-p-([\w-]+)\)$/.exec(raw);
  if (pattern) return `p:${pattern[1] ?? ''}`;
  const token = HEX_TO_TOKEN.get(raw.toUpperCase());
  if (!token) throw new Error(`${where}: colour ${raw} has no token in src/styles/tokens.ts`);
  return `c:${token}`;
}

function toNode(element: ParsedElement, where: string): SvgNode {
  if (!isSvgTag(element.tag)) throw new Error(`${where}: unsupported <${element.tag}>`);
  const attrs: Record<string, string> = {};
  for (const [name, value] of Object.entries(element.attrs)) {
    if (name === 'class' || name === 'style') {
      throw new Error(`${where}: "${name}" inside a drawing is not supported`);
    }
    attrs[camel(name)] = encodeValue(name, value, where);
  }
  const children = element.children.map((child) => toNode(child, where));
  return children.length ? [element.tag, attrs, children] : [element.tag, attrs];
}

export function convertSvg(svg: SourceSvg, where: string): GraphicData {
  return { viewBox: svg.viewBox, nodes: parseElements(svg.inner).map((e) => toNode(e, where)) };
}

/** Finds an entry's canonical SVG among the board files ({ file name → contents }). */
export function locate(entry: ManifestEntry, boards: Record<string, string>): SourceSvg {
  const text = boards[entry.file];
  if (text === undefined) throw new Error(`${entry.name}: no board ${entry.file}`);
  const viewBox = entry.viewBox ?? '0 0 48 48';
  const candidates = findSvgs(text).filter((svg) => svg.viewBox === viewBox);
  if (entry.label !== undefined) {
    const found = candidates.find((svg) => svg.label === entry.label);
    if (!found) throw new Error(`${entry.name}: no "${entry.label}" (${viewBox}) in ${entry.file}`);
    return found;
  }
  const found = candidates[entry.index ?? 0];
  if (!found)
    throw new Error(`${entry.name}: no ${viewBox} #${String(entry.index)} in ${entry.file}`);
  return found;
}

/** The shared fill patterns (<pattern id="wl-p-…">) from a board's hidden <defs>. */
export function extractPatterns(boardText: string): Record<string, GraphicData> {
  const defs = /<defs>([\s\S]*?)<\/defs>/.exec(boardText)?.[1];
  if (!defs) throw new Error('No <defs> with patterns found');
  const patterns: Record<string, GraphicData> = {};
  for (const element of parseElements(defs)) {
    const id = element.attrs.id ?? '';
    const name = /^wl-p-([\w-]+)$/.exec(id)?.[1];
    if (element.tag !== 'pattern' || !name)
      throw new Error(`Unexpected <${element.tag} id="${id}"> in defs`);
    // The id is added back at render time (PatternDefs), from the pattern's name.
    const attrs = Object.fromEntries(Object.entries(element.attrs).filter(([key]) => key !== 'id'));
    const node = toNode({ ...element, attrs }, `pattern ${name}`);
    patterns[name] = { viewBox: '', nodes: [node] };
  }
  return patterns;
}
