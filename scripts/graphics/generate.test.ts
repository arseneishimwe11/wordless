// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { color } from '../../src/styles/tokens';

import { convertSvg } from './convert';
import { GENERATED_DIR, generateGraphics } from './generate';
import { glyphs, icons, illustrations, pills } from './manifest';

const root = fileURLToPath(new URL('../..', import.meta.url));
const sourceDir = join(root, 'design/source');
const boards = Object.fromEntries(
  readdirSync(sourceDir)
    .filter((name) => name.endsWith('.dc.html'))
    .map((name) => [name, readFileSync(join(sourceDir, name), 'utf8')]),
);
const generated = generateGraphics(boards);

function filesOnDisk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesOnDisk(join(dir, entry.name))
      : [relative(join(root, GENERATED_DIR), join(dir, entry.name))],
  );
}

describe('generated graphics', () => {
  it('are up to date with the design source (run `npm run graphics`)', () => {
    const onDisk = filesOnDisk(join(root, GENERATED_DIR)).sort();
    expect(onDisk).toEqual(Object.keys(generated).sort());
    for (const [path, text] of Object.entries(generated)) {
      expect(readFileSync(join(root, GENERATED_DIR, path), 'utf8'), path).toBe(text);
    }
  });

  it('give every graphic a unique name', () => {
    const names = [...glyphs, ...pills, ...icons, ...illustrations].map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('contain no raw colours, only tokens, patterns and slots', () => {
    const all = Object.values(generated).join('\n');
    expect(all).not.toMatch(/#[0-9a-f]{6}\b/i);
    const tokens = [...all.matchAll(/"c:([\w-]+)"/g)].map((m) => m[1] ?? '');
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of new Set(tokens)) expect(color, token).toHaveProperty(token);
  });

  it('refer only to patterns that exist', () => {
    const patternNames = [...(generated['patterns.ts'] ?? '').matchAll(/^ {2}"([\w-]+)":/gm)].map(
      (m) => m[1],
    );
    const used = new Set(
      [
        ...Object.values(generated)
          .join('\n')
          .matchAll(/"p:([\w-]+)"/g),
      ].map((m) => m[1]),
    );
    for (const name of used) expect(patternNames).toContain(name);
  });

  it('use colour slots only in pill shapes; each coloured shape takes base and pattern', () => {
    for (const [path, text] of Object.entries(generated)) {
      if (path !== 'pillShapes.ts') expect(text, path).not.toMatch(/"s:/);
    }
    const pillsText = generated['pillShapes.ts'] ?? '';
    // A puff is drawn as a plain white cloud in the design, whatever the inhaler's colour.
    const uncoloured = new Set(['puff']);
    for (const pill of pills) {
      const line = pillsText.split('\n').find((l) => l.startsWith(`  "${pill.name}":`)) ?? '';
      if (uncoloured.has(pill.name)) {
        expect(line, pill.name).not.toMatch(/"s:/);
      } else {
        expect(line, pill.name).toContain('"s:base"');
        expect(line, pill.name).toContain('"s:pattern"');
      }
    }
  });
});

describe('convertSvg', () => {
  it('maps colours to tokens, patterns and placeholders to slots, attributes to React names', () => {
    const data = convertSvg(
      {
        viewBox: '0 0 48 48',
        label: null,
        inner:
          '<g stroke="#1F1C33" stroke-width="2.6"><path d="M0 0" fill="{{ u.base }}"/><path d="M1 1" fill="url(#wl-p-dots)" stroke-opacity="{{ u.scoreOp }}"/></g>',
      },
      'test',
    );
    expect(data.nodes).toEqual([
      [
        'g',
        { stroke: 'c:ink', strokeWidth: '2.6' },
        [
          ['path', { d: 'M0 0', fill: 's:base' }],
          ['path', { d: 'M1 1', fill: 'p:dots', strokeOpacity: 's:score' }],
        ],
      ],
    ]);
  });

  it('refuses colours that have no token', () => {
    expect(() =>
      convertSvg(
        { viewBox: '0 0 1 1', label: null, inner: '<path d="M0 0" fill="#123456"/>' },
        'x',
      ),
    ).toThrow(/no token/);
  });
});
