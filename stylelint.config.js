/**
 * Every visual value must come from a design token (a CSS custom property from
 * src/styles/tokens.css). Raw colours, sizes, spaces, radii, shadows and durations
 * are rejected everywhere except src/styles/, where the tokens and the base reset
 * themselves are defined.
 *
 * Layout dimensions (width, height, top, left, …) are not restricted: they come
 * from component geometry, not from the design system.
 *
 * @type {import('stylelint').Config}
 */

const tokenOnlyProperties = [
  // colour
  '/color$/',
  'fill',
  'stroke',
  'background',
  'outline',
  // type
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'line-height',
  // shape
  'border-radius',
  '/^border(-(top|right|bottom|left))?(-width)?$/',
  'box-shadow',
  // space
  '/^(row-|column-)?gap$/',
  '/^padding/',
  '/^margin/',
  // motion and stacking
  'transition-duration',
  'animation-duration',
  'z-index',
];

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  // Generated from src/styles/tokens.ts; kept in sync by src/styles/tokens.test.ts.
  ignoreFiles: ['src/styles/tokens.css'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      tokenOnlyProperties,
      {
        ignoreValues: [
          '0',
          'auto',
          'none',
          'inherit',
          'initial',
          'unset',
          'revert',
          'currentcolor',
          'transparent',
          '100%',
          'solid',
          'dashed',
          'dotted',
          'normal',
        ],
        disableFix: true,
      },
    ],
    // CSS Modules class names are written in camelCase so they read naturally in TSX.
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      { message: 'Use camelCase class names (CSS Modules).' },
    ],
  },
  overrides: [
    {
      // Token definitions, reset, keyframes and print rules legitimately hold raw values.
      files: ['src/styles/**/*.css'],
      rules: { 'scale-unlimited/declaration-strict-value': null },
    },
  ],
};
