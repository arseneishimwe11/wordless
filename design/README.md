# Design

The source of truth for how Wordless looks. Nothing in this folder is shipped or imported at runtime.

## `source/`

The design canvas ("Wordless"), exported as-is from the Claude Design artifact on 2026-11-24:

- `canvas.json`: the canvas index, listing artboards, their sizes and titles.
- `*.dc.html`: one file per artboard. Each holds the markup and a small `Component` script, which is the reference for behaviour (states, wording, animation timing).
- `grain.png`: the paper texture laid over every screen.

These files are **read-only inputs**. Scripts in `/scripts` read them, for example to extract the pictograms in Phase 3. Do not edit them by hand. If the design changes, export it again and re-run the scripts.

## `reference/`

Screenshots of every artboard, rendered at its design size (deviceScaleFactor 1) and stored as WebP (quality 82). They are the baseline for visual QA: each screen we build is screenshotted at the same size and compared side by side.

| File | Viewport |
|---|---|
| Phone screens: `Start`, `AddMedicine`, `When`, `HowLong`, `Rules`, `Household`, `SheetPreview`, `SunArc`, `LandingMobile` | 390 × 844 |
| Printables: `FridgeSheet`, `FridgeSheetMono`, `DailyStrip`, `PrintEdgeCases`, `LiveSheet` | 794 × 1123 (A4 at 96 dpi) |
| Desktop: `DesktopEntry`, `DesktopEntryMedicine`, `DesktopPrint` | 1440 wide, plus `@1280` / `@1024` |
| Landing: `Landing` | 1440 wide, plus `@1024` / `@768` / `@360` |
| Boards: `Main`, `Pictograms`, `Pills`, `SunArcStates`, `AddMedicineStates`, `HowLongStates` | Board size |

Fluid boards are captured as full-page screenshots.

### Regenerating the references

The boards render with the design tool's own runtime, which is not part of this repository. To regenerate:

1. Download the canvas files and `artifact-type/dc-runtime.js` from the design artifact.
2. Put the boards in one folder, save the runtime beside them as `support.js`, and save the grain at `_blob/4d7804bf572af9cc85e09178a9207d13`.
3. Serve the folder on localhost (`python3 -m http.server --bind 127.0.0.1`).
4. Screenshot each board with Playwright at the viewport above, waiting about 3.5 s for entrance animations to settle.
5. Convert to WebP at quality 82.
