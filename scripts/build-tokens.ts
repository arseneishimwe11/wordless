/**
 * Writes src/styles/tokens.css from src/styles/tokens.ts.
 * Run with `npm run tokens` (Node 22 runs TypeScript directly).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { renderTokensCss, tokenDeclarations } from '../src/styles/tokensCss.ts';

const target = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url));
writeFileSync(target, renderTokensCss());
console.log(`Wrote ${String(tokenDeclarations().length)} tokens to src/styles/tokens.css`);
