/**
 * Every English string the interface shows lives here, so wording is reviewed in
 * one place and can be translated later without touching components.
 */
export const copy = {
  app: {
    name: 'Wordless',
    tagline: 'Any prescription, in pictures.',
  },
  home: {
    title: 'Wordless',
    lead: 'Enter a prescription exactly as written. Wordless draws a sheet anyone can follow — no reading, no shared language.',
    building: 'This is the project scaffold. The screens arrive in the next phases.',
  },
  errors: {
    title: 'Something went wrong',
    notFoundTitle: 'Page not found',
    notFoundBody: 'There is nothing at this address.',
    unexpectedBody: 'An unexpected error stopped this page from loading.',
  },
} as const;
