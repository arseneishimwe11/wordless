/**
 * Builds the contents of every file in src/graphics/generated/ from the design
 * source. Pure: takes the board files, returns { relative path → file text }.
 */
import type { GraphicData } from '../../src/graphics/types.ts';

import { convertSvg, extractPatterns, locate } from './convert.ts';
import { glyphs, icons, illustrations, pills, type ManifestEntry } from './manifest.ts';

export const GENERATED_DIR = 'src/graphics/generated';

const HEADER = `/*
 * GENERATED FILE: do not edit.
 * Source: design/source/*.dc.html, chosen by scripts/graphics/manifest.ts.
 * Regenerate with \`npm run graphics\`.
 */`;

const camel = (name: string) => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function collection(entries: ManifestEntry[], boards: Record<string, string>) {
  const out: Record<string, GraphicData> = {};
  for (const entry of entries) {
    if (entry.name in out) throw new Error(`Duplicate graphic name "${entry.name}"`);
    out[entry.name] = convertSvg(locate(entry, boards), `${entry.name} (${entry.file})`);
  }
  return out;
}

/** One entry per line, so regenerating after a design change gives a readable diff. */
function renderCollection(
  exportName: string,
  typeName: string,
  data: Record<string, GraphicData>,
  doc: string,
) {
  const body = Object.entries(data)
    .map(([name, graphic]) => `  ${JSON.stringify(name)}: ${JSON.stringify(graphic)},`)
    .join('\n');
  return `${HEADER}
import type { GraphicData } from '../types';

/** ${doc} */
export const ${exportName} = {
${body}
} satisfies Record<string, GraphicData>;

export type ${typeName} = keyof typeof ${exportName};
`;
}

export function generateGraphics(boards: Record<string, string>): Record<string, string> {
  const files: Record<string, string> = {};

  files['glyphs.ts'] = renderCollection(
    'glyphs',
    'GlyphName',
    collection(glyphs, boards),
    'Pictograms on the 48-unit grid: times of day, rules, marks, swatches, household marks.',
  );
  files['pillShapes.ts'] = renderCollection(
    'pillShapes',
    'PillShapeName',
    collection(pills, boards),
    'Pill drawings with colour slots (base, pattern, base2, pattern2, score), filled in by PillUnit.',
  );
  files['icons.ts'] = renderCollection(
    'icons',
    'IconName',
    collection(icons, boards),
    'Interface icons, drawn in currentColor.',
  );

  const mainBoard = boards['Main.dc.html'];
  if (mainBoard === undefined) throw new Error('Main.dc.html is missing');
  files['patterns.ts'] = renderCollection(
    'patterns',
    'PatternName',
    extractPatterns(mainBoard),
    'Fill patterns that pair with each pill colour, so colours survive black and white printing.',
  );

  for (const [name, graphic] of Object.entries(collection(illustrations, boards))) {
    files[`illustrations/${name}.ts`] = `${HEADER}
import type { GraphicData } from '../../types';

export const ${camel(name)}: GraphicData = ${JSON.stringify(graphic)};
`;
  }
  return files;
}
