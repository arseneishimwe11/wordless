import { cssTokens } from './tokens.ts';

export const GENERATED_HEADER = `/*
 * GENERATED FILE: do not edit.
 * Source: src/styles/tokens.ts. Regenerate with \`npm run tokens\`.
 */`;

type TokenGroups = Record<string, Record<string, string>>;

/** Flattens token groups into `--{group}-{key}: value` declarations, in source order. */
export function tokenDeclarations(
  groups: TokenGroups = cssTokens,
): [name: string, value: string][] {
  return Object.entries(groups).flatMap(([group, values]) =>
    Object.entries(values).map(([key, value]): [string, string] => [`--${group}-${key}`, value]),
  );
}

/** The full contents of tokens.css. */
export function renderTokensCss(groups: TokenGroups = cssTokens): string {
  const lines: string[] = [];
  let currentGroup = '';
  for (const [name, value] of tokenDeclarations(groups)) {
    const group = name.slice(2, name.indexOf('-', 2));
    if (group !== currentGroup) {
      if (currentGroup) lines.push('');
      lines.push(`  /* ${group} */`);
      currentGroup = group;
    }
    lines.push(`  ${name}: ${value};`);
  }
  return `${GENERATED_HEADER}\n\n:root {\n${lines.join('\n')}\n}\n`;
}
