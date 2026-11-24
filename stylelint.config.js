/**
 * Colours must come from design tokens (CSS custom properties), never raw values.
 * Phase 2 extends the same rule to font sizes, spacing, radii and shadows once
 * the token set exists.
 *
 * @type {import('stylelint').Config}
 */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke', 'background', 'box-shadow', 'outline'],
      {
        ignoreValues: ['currentcolor', 'inherit', 'initial', 'unset', 'transparent', 'none', '0'],
        disableFix: true,
      },
    ],
    // CSS Modules class names are written in camelCase so they read naturally in TSX.
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      { message: 'Use camelCase class names (CSS Modules).' },
    ],
  },
};
