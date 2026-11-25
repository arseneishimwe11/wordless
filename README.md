# Wordless

Wordless turns a prescription into a medicine schedule anyone can follow without reading a word. The sun's path shows the time, every pill is drawn as it really looks, and every dose gets a box to tick. A pharmacist or health worker enters the prescription exactly as written, and Wordless prints a sheet for the fridge, or daily strips. It never calculates or suggests a dose.

It runs entirely in the browser. There is no server and no account, and schedules stay on the device.

> **Status:** Phase 4 of 11, UI primitives. See [Roadmap](#roadmap).

## Getting started

Requires **Node 22** (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

End-to-end tests use Playwright's Chromium. On a new machine, install it once:

```bash
npx playwright install chromium
```

## Scripts

| Script              | What it does                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run dev`       | Development server with hot reload                                       |
| `npm run build`     | Production build into `build/client` (a static single-page app)          |
| `npm run tokens`    | Regenerates `src/styles/tokens.css` from `src/styles/tokens.ts`          |
| `npm run graphics`  | Re-extracts `src/graphics/generated/` from `design/source/`              |
| `npm run preview`   | Serves the production build                                              |
| `npm run typecheck` | Generates route types, then runs TypeScript (strict)                     |
| `npm run lint`      | ESLint: TypeScript, React hooks, accessibility (jsx-a11y strict)         |
| `npm run lint:css`  | Stylelint: CSS must use design tokens, not raw values                    |
| `npm run format`    | Formats everything with Prettier (`format:check` only verifies)          |
| `npm run test`      | Unit and component tests (Vitest + Testing Library)                      |
| `npm run test:e2e`  | End-to-end tests against the production build (Playwright + axe)         |
| `npm run check`     | Everything above, in order. CI runs this on every push and pull request. |

## Project structure

```
design/            The design: source boards (read-only) and reference screenshots. See design/README.md.
e2e/               Playwright end-to-end tests.
public/            Static files served as-is (favicon).
scripts/           Build-time scripts, such as extracting pictograms from design/source.
src/
  root.tsx         App shell: <html>, meta, error boundary.
  routes.ts        Route table.
  routes/          One module per screen. Thin: reads state, composes features.
  features/        Feature components (sun-arc, pill-builder, course, rules, household, sheet, print, landing).
  components/      UI primitives (Button, SegmentedControl, Stepper, …). No domain knowledge.
  graphics/        Pictograms, pills, household marks, illustrations. Pure rendering.
  domain/          Pure TypeScript model and rules. No React, no browser APIs.
  store/           Application state and on-device persistence.
  styles/          Design tokens, global styles, motion, print.
  copy/            Every user-facing English string.
  lib/             Small shared helpers (cx for class names).
  test/            Test setup.
```

Dependencies point one way: `routes → features → components / graphics → styles`, and anything may use `domain` and `copy`. `domain` depends on nothing in `src`.

## Conventions

**Naming**

- Components are PascalCase folders, with styles, tests and a public entry beside the component:
  ```
  components/Button/
    Button.tsx
    Button.module.css
    Button.test.tsx
    index.ts          export { Button } from './Button';
  ```
- Other TypeScript modules use camelCase file names (`scheduleSummary.ts`). Folders under `features/` use kebab-case (`sun-arc/`).
- Route URLs use kebab-case (`/how-long`).
- CSS Module class names use camelCase (`.doseChip`).
- Use named exports only. The exceptions are route modules and `root.tsx`, which React Router requires to export a default; ESLint enforces this.
- Import from `src` with `@/` (`import { copy } from '@/copy/en'`), and use relative paths only inside a component's own folder.

**Styling**

- Every color, size, space, radius, shadow and duration comes from a design token (see [Design tokens](#design-tokens)). Stylelint rejects raw values.
- CSS Modules are co-located with components. Global CSS lives only in `src/styles/`.
- Build mobile-first. Every animation must respect `prefers-reduced-motion`.

**Text**

- All interface text lives in `src/copy/en.ts`. Components never hardcode wording, so it can be reviewed in one place and translated later.

**Accessibility**

- Use semantic HTML first (`button`, `a`, `input` + `label`). Add ARIA only where HTML has no equivalent.
- Every interactive element must work from the keyboard and show a visible focus style.
- Text meets WCAG AA contrast. Meaning is never carried by color alone.

**Tests**

- Domain rules get unit tests. Components get behaviour tests (Testing Library: query by role and label). Screens get Playwright tests, including an axe scan.

## Components

`src/components/` holds the UI primitives every screen is built from. They take their words as props (from `src/copy/`) and know nothing about medicines. Each is shown live in every state on `/styleguide`, next to exact-size specimens of the design.

| Group             | Components                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Actions           | `Button` (primary, secondary, dashed, text; sizes 48–64; `pending`; key hints; `href` makes it a link), `IconButton`                                   |
| Choices           | `SegmentedControl`, `ChoiceGroup` (number and text chips), `ToggleCard` (form, rule and print cards), `Swatch`, `PersonChip`, grouped by `OptionGroup` |
| Inputs            | `Stepper` and `StepperButton`, `TextField`, `NumberField`, `Checkbox`                                                                                  |
| Wayfinding        | `StepProgress` (phone), `StepRail` and `StepRailItem` (desktop), `ListRow`                                                                             |
| Surfaces and text | `Card` (well, surface, dashed, panel, feature, sheet, phone), `Kbd`, `Eyebrow`, `HandNote`, `Summary`                                                  |
| Motion            | `Animated`: plays a design animation, again whenever `replay` changes                                                                                  |

**Conventions:**

- **Choices are real form controls.** Pick-one controls are native radio buttons and pick-many are checkboxes, visually hidden behind a styled face. The browser supplies arrow keys, labels and screen-reader roles; don't rebuild them with `aria-pressed`.
- **"Not ready yet" is `pending`, never `disabled`.** The button stays pressable so it can explain what is missing.
- **States, everywhere the same:**
  - Hover: raised controls lift 1px; unselected choices take the sunrise wash.
  - Pressed: controls sink 1px.
  - Disabled: faded (`--opacity-muted`).
  - Focus: a 3px pen outline, drawn on the visible face (or around a whole segmented track).
  - Error: `--color-error`, with `--color-error-wash` behind fields.
- **Accessible names stay readable.** Key hints are hidden from screen readers. Separate visible text pieces get a space between them, so names never run together ("Paracetamolonly when needed").

## Design tokens

Every visual value in the design lives in **`src/styles/tokens.ts`**: one typed file and the only place a hex code or pixel size is written. `npm run tokens` turns it into `src/styles/tokens.css`, which defines a CSS custom property for each token, named `--{group}-{key}`. A unit test fails if the two files drift apart.

| Group                                            | Example                                                   | Notes                                                                             |
| ------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `color`                                          | `--color-ink`, `--color-sunrise-tint`, `--color-pill-red` | Paper and ink, the four times of day (ink, tint, wash), states, pill colors       |
| `display`                                        | `--display-26` → 23.92px                                  | Young Serif, keyed by the **size written in the design**; drawn at ×0.92          |
| `text`                                           | `--text-17`                                               | Every other font size, exactly as designed                                        |
| `leading`                                        | `--leading-normal`, `--leading-130`                       | `normal` is the design's default; others are ×100 (`130` = 1.3)                   |
| `space`                                          | `--space-14`                                              | Gaps, padding and margins, by their px value                                      |
| `stroke`                                         | `--stroke-base` (2.5px)                                   | Line weights                                                                      |
| `radius`                                         | `--radius-control`, `--radius-cell-1…4`                   | Hand-drawn corners; numbered families are rotated so repeats never look identical |
| `shadow`                                         | `--shadow-cta`, `--shadow-dose-offset`                    | Hard, unblurred shadows and rings                                                 |
| `duration`, `ease`                               | `--duration-drop`, `--ease-drop`                          | Paired with the keyframes in `motion.css`                                         |
| `opacity`, `layer`, `font`, `weight`, `tracking` |                                                           |                                                                                   |

Sizes keep the numbers the design uses, so a value seen in the design maps to exactly one token, without converting it to a scale step.

**Adding or changing a token:** edit `tokens.ts`, run `npm run tokens`, and commit both files.

**Rules that bite:**

- A token can only refer to other tokens. Custom properties resolve where they are defined (`:root`), so a token like `var(--dose-color)` would ignore the element's value. For colors that vary per element, tokens hold the geometry and the component adds the color: `box-shadow: var(--shadow-dose-offset) var(--dose-color)`. A unit test enforces this.
- The design sizes elements content-box: a `60px` swatch with a 2px border is 64px wide. The app uses border-box, so when copying a size from the design, add its border widths.
- Text color pairs are listed in `textPairs`, and a unit test checks each one against WCAG AA. Add a pair whenever you put text on a new background.
- Breakpoints (`breakpoint` in `tokens.ts`) are TypeScript only, because CSS can't use custom properties in media queries. Write them as literal numbers in CSS (`@media (width >= 1024px)`), matching the constants.

## Graphics

Every pictogram, pill, icon and illustration is **extracted from the design source**, not redrawn: `npm run graphics` writes `src/graphics/generated/` from the drawings listed in `scripts/graphics/manifest.ts`. Use the components in `src/graphics/` (`Glyph`, `PillUnit`, `PillStack`, `HouseholdMark`, `Icon`, `Illustration`), see `src/graphics/README.md`.

The styleguide at **`/styleguide`** (not linked, `noindex`) rebuilds the design's color and type, pictogram and pill boards, and lists every token, with motion demos and measured contrast.

## Roadmap

1. Scaffolding and tooling ✔
2. Design tokens and global styles ✔
3. Pictogram, pill and illustration library ✔
4. UI primitives ✔
5. Domain model, storage and QR code
6. Phone flow: Start → Medicine → When → How long → Rules → Household → Print
7. Printables: fridge sheet, daily strips, black and white printing
8. Desktop: split view with live sheet, print page
9. Landing page
10. Hardening and final visual QA
11. Screens the design doesn't cover yet: offline install, scanning a sheet, people, editing
