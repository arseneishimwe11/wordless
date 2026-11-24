/*
 * GENERATED FILE: do not edit.
 * Source: design/source/*.dc.html, chosen by scripts/graphics/manifest.ts.
 * Regenerate with `npm run graphics`.
 */
import type { GraphicData } from '../types';

/** Fill patterns that pair with each pill colour, so colours survive black and white printing. */
export const patterns = {
  "dots": {"viewBox":"","nodes":[["pattern",{"width":"6","height":"6","patternUnits":"userSpaceOnUse"},[["circle",{"cx":"3","cy":"3","r":"1.35","fill":"c:ink","fillOpacity":".55"}]]]]},
  "diag": {"viewBox":"","nodes":[["pattern",{"width":"5.5","height":"5.5","patternUnits":"userSpaceOnUse","patternTransform":"rotate(45)"},[["rect",{"width":"1.9","height":"5.5","fill":"c:ink","fillOpacity":".5"}]]]]},
  "back": {"viewBox":"","nodes":[["pattern",{"width":"5.5","height":"5.5","patternUnits":"userSpaceOnUse","patternTransform":"rotate(-45)"},[["rect",{"width":"1.9","height":"5.5","fill":"c:ink","fillOpacity":".5"}]]]]},
  "horiz": {"viewBox":"","nodes":[["pattern",{"width":"6","height":"5","patternUnits":"userSpaceOnUse"},[["rect",{"width":"6","height":"1.7","fill":"c:ink","fillOpacity":".5"}]]]]},
  "vert": {"viewBox":"","nodes":[["pattern",{"width":"5","height":"6","patternUnits":"userSpaceOnUse"},[["rect",{"width":"1.7","height":"6","fill":"c:white","fillOpacity":".55"}]]]]},
  "cross": {"viewBox":"","nodes":[["pattern",{"width":"6","height":"6","patternUnits":"userSpaceOnUse","patternTransform":"rotate(45)"},[["rect",{"width":"1.4","height":"6","fill":"c:ink","fillOpacity":".5"}],["rect",{"width":"6","height":"1.4","fill":"c:ink","fillOpacity":".5"}]]]]},
  "check": {"viewBox":"","nodes":[["pattern",{"width":"8","height":"8","patternUnits":"userSpaceOnUse"},[["rect",{"width":"4","height":"4","fill":"c:ink","fillOpacity":".38"}],["rect",{"x":"4","y":"4","width":"4","height":"4","fill":"c:ink","fillOpacity":".38"}]]]]},
  "rings": {"viewBox":"","nodes":[["pattern",{"width":"7","height":"7","patternUnits":"userSpaceOnUse"},[["circle",{"cx":"3.5","cy":"3.5","r":"1.9","fill":"none","stroke":"c:ink","strokeWidth":"1.1","strokeOpacity":".6"}]]]]},
  "zig": {"viewBox":"","nodes":[["pattern",{"width":"8","height":"5","patternUnits":"userSpaceOnUse"},[["path",{"d":"M0 4L2 1.2L4 4L6 1.2L8 4","fill":"none","stroke":"c:ink","strokeWidth":"1.15","strokeOpacity":".6"}]]]]},
  "pstripe": {"viewBox":"","nodes":[["pattern",{"width":"7","height":"7","patternUnits":"userSpaceOnUse","patternTransform":"rotate(45)"},[["rect",{"width":"2.6","height":"7","fill":"c:ink","fillOpacity":".42"}]]]]},
} satisfies Record<string, GraphicData>;

export type PatternName = keyof typeof patterns;
