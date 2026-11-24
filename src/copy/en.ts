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
  styleguide: {
    pageTitle: 'Styleguide · Wordless',
    placeholder: 'drawn in Phase 3',
    board: {
      eyebrow: 'Wordless · design system · stage 1',
      wordmark: 'wordless',
      logoLabel: 'Logo: the sun rising over the horizon',
      tagline: 'The pharmacist’s pen, made beautiful.',
      lead: 'A medicine schedule anyone can follow without reading a word: the sun’s path for time, every pill drawn as it really looks, and a box for every dose.',
      boxLabel: 'A medicine box with suns and a moon drawn on it in ballpoint pen',
      timeTitle: 'Time is the color',
      timeLead:
        'Four inks, one for each moment the patient already knows. They darken as the day goes, so a black-and-white printer keeps the order — and every color always travels with its own symbol.',
      sunPathLabel: 'The four day colors as the sun travels from sunrise to night',
      tint: 'tint',
      blackWhite: 'black & white:',
      inkSuffix: 'ink',
      times: {
        sunrise: { name: 'Sunrise', when: 'morning · ≈ 6 am', ink: 'Saffron' },
        midday: { name: 'Midday', when: 'middle of the day · ≈ 12 pm', ink: 'Coral' },
        sunset: { name: 'Sunset', when: 'evening · ≈ 6 pm', ink: 'Terracotta' },
        night: { name: 'Night', when: 'bedtime · ≈ 10 pm', ink: 'Ink indigo' },
      },
      paperTitle: 'Paper & ink',
      paper: {
        paper: { name: 'Paper', note: 'the ground — warm, never stark white' },
        'paper-deep': { name: 'Paper deep', note: 'wells, chips, quiet surfaces' },
        rule: { name: 'Rule', note: 'dividers and grid lines' },
        ink: { name: 'Ink', note: 'lines and text · 14 : 1 on paper' },
        'ink-soft': { name: 'Ink soft', note: 'second-level text · 6.4 : 1' },
        pen: { name: 'Pen', note: 'the pharmacist’s pen · hints only' },
      },
      typeTitle: 'Type',
      type: {
        display: {
          sample: 'When does it go in?',
          family: 'Young Serif',
          note: ' · heavy old-style serif · headings, numbers and the wordmark',
        },
        body: {
          sampleStrong: 'Amoxicillin 500 mg',
          sample: ' — 1 capsule, 3 times a day',
          family: 'Atkinson Hyperlegible Next',
          note: ' · all interface text · never under 16 px on the phone or 12 pt on paper',
        },
        hand: {
          sample: 'tap the sky — or drag the sun',
          family: 'Kalam',
          note: ', in pen ink · gentle hints for the pharmacist, never an instruction to the patient',
        },
      },
    },
    tokens: {
      title: 'Tokens',
      lead: 'Every value in the interface comes from this list. Names keep the number used in the design.',
      groups: {
        space: 'Space',
        stroke: 'Line weights',
        radius: 'Hand-drawn corners',
        shadow: 'Shadows and rings',
        motion: 'Motion',
        contrast: 'Text contrast (WCAG AA)',
      },
      replay: 'Replay animations',
      contrastCaption: 'Every text color the design puts on a background, measured.',
      contrastColumns: {
        sample: 'Sample',
        pair: 'Text on background',
        where: 'Used for',
        ratio: 'Ratio',
        result: 'Result',
      },
      sampleText: 'Aa',
      pass: 'Pass',
      fail: 'Fail',
      largeOnly: 'large text',
    },
  },
} as const;
