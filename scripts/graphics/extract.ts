/**
 * Writes src/graphics/generated/ from design/source. Run with `npm run graphics`.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GENERATED_DIR, generateGraphics } from './generate.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const sourceDir = join(root, 'design/source');

const boards = Object.fromEntries(
  readdirSync(sourceDir)
    .filter((name) => name.endsWith('.dc.html'))
    .map((name) => [name, readFileSync(join(sourceDir, name), 'utf8')]),
);

const files = generateGraphics(boards);
const outDir = join(root, GENERATED_DIR);
rmSync(outDir, { recursive: true, force: true });
for (const [path, text] of Object.entries(files)) {
  const target = join(outDir, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}
console.log(`Wrote ${String(Object.keys(files).length)} files to ${GENERATED_DIR}`);
