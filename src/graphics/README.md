# graphics

The drawn language of Wordless: pictograms, pills, household marks, icons and illustrations. Pure rendering, no app state.

Every drawing is **extracted from the design**, not redrawn: `npm run graphics` reads `design/source/*.dc.html`, picks one canonical copy of each drawing (listed in `scripts/graphics/manifest.ts`), and writes `generated/`. Never edit `generated/` by hand. A unit test fails if it drifts from the design source.

| Component       | Use it for                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Glyph`         | A 48-unit pictogram: time of day, rule, mark, swatch, form icon                                                                                                         |
| `PillUnit`      | One unit of a dose in a chosen colour (`kind`, `color`, `color2` for a capsule body, `score`)                                                                           |
| `PillStack`     | A whole dose (`form`, `qty`), sized for its context: `builder`, `builder-desktop`, `sheet`                                                                              |
| `HouseholdMark` | A person's mark, A–D                                                                                                                                                    |
| `Icon`          | Interface icons, drawn in `currentColor`                                                                                                                                |
| `Illustration`  | Larger drawings. Import the data from its own module so pages only load what they show: `import { medicineBox } from '@/graphics/generated/illustrations/medicine-box'` |
| `PatternDefs`   | The fill patterns paired with each pill colour. Mounted once in `root.tsx`                                                                                              |

Accessibility: pass `label` when the drawing carries meaning that no nearby text gives; leave it out for decoration, and the drawing is hidden from screen readers.

Colours: drawings only ever reference tokens (`var(--color-…)`), patterns (`url(#wl-p-…)`) or pill slots. The extractor refuses any colour without a token.

To add a drawing: add an entry to `scripts/graphics/manifest.ts` (board file, plus its `aria-label` or its position among that board's SVGs of the same viewBox), run `npm run graphics`, commit `generated/`.
