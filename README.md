# Wordless

Wordless turns a prescription into a medicine schedule anyone can follow without reading a word. The sun's path shows the time, every pill is drawn as it really looks, and every dose gets a box to tick. A pharmacist or health worker enters the prescription exactly as written, and Wordless prints a sheet for the fridge, or daily strips. It never calculates or suggests a dose.

It runs entirely in the browser. There is no server and no account, and schedules stay on the device.

> **Status:** Phase 1 of 11, project scaffold. See [Roadmap](#roadmap).

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

- Every color, size, space, radius, shadow and duration comes from a design token (CSS custom properties, introduced in Phase 2). Stylelint rejects raw values.
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

## Roadmap

1. Scaffolding and tooling ✔
2. Design tokens and global styles
3. Pictogram, pill and illustration library
4. UI primitives
5. Domain model, storage and QR code
6. Phone flow: Start → Medicine → When → How long → Rules → Household → Print
7. Printables: fridge sheet, daily strips, black and white printing
8. Desktop: split view with live sheet, print page
9. Landing page
10. Hardening and final visual QA
11. Screens the design doesn't cover yet: offline install, scanning a sheet, people, editing
