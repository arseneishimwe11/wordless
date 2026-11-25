/**
 * Where everything sits on an A4 fridge sheet, in CSS px at 96 dpi (794 × 1123), from
 * FridgeSheet.dc.html. The design shows one page with two medicines; this places any
 * number of medicines, starting a new page when the next block would not fit.
 */
import type { CourseTrack, Sheet, SheetRow } from '@/domain';

export const PAGE = { width: 794, height: 1123 } as const;

/** The dose table: medicine cards on the left, one column per time. */
export const TABLE = {
  left: 40,
  cardWidth: 182,
  columnsLeft: 232,
  right: 754,
  columnGap: 8,
  headTop: 52,
  headHeight: 144,
  firstRowTop: 206,
  rowGap: 8,
} as const;

/** Row heights shrink as more medicines share a page. */
const ROW_HEIGHTS = [
  { upTo: 2, scheduled: 150, whenNeeded: 120 },
  { upTo: 4, scheduled: 110, whenNeeded: 96 },
  { upTo: Infinity, scheduled: 92, whenNeeded: 80 },
] as const;

/** The course grids and tallies: a band per dose time, a box per day. */
export const TRACKS = {
  bandLeft: 156,
  bandWidth: 504,
  /** Day centres start here and share this width. */
  daysLeft: 201,
  daysWidth: 462,
  bandHeight: 46,
  bandGap: 6,
  /** The day numbers sit above the first band. */
  numbersHeight: 38,
  tallyHeight: 58,
  noteHeight: 24,
  gap: 18,
  /** From the rule above the tracks to the first track. */
  fromRule: 74,
} as const;

/** Everything below the tracks is fixed: legend, cut rule, code and footer. */
export const FOOT = { legendTop: 862, ruleTop: 940, footerTop: 960 } as const;

/** Tracks must end before the legend. */
const LIMIT = FOOT.legendTop - 24;

/** A page with no dose table starts with the name line and mark, then a rule. */
const CONTINUED_RULE_TOP = 180;

export interface PlacedRow {
  index: number;
  top: number;
  height: number;
}

export interface PlacedTrack {
  index: number;
  top: number;
  height: number;
}

export interface FridgePage {
  /** The time headers and medicine rows on this page (none on a continuation page). */
  rows: PlacedRow[];
  /** The rule and "Tick one box each time" above the tracks; null with no tracks here. */
  ruleTop: number | null;
  tracks: PlacedTrack[];
}

export function rowHeight(row: SheetRow, count: number): number {
  const sizes = ROW_HEIGHTS.find((s) => count <= s.upTo) ?? ROW_HEIGHTS[2];
  return row.kind === 'scheduled' ? sizes.scheduled : sizes.whenNeeded;
}

/** A track's height: its bands (with the day numbers above a grid), and a note if any. */
export function trackHeight(track: CourseTrack, hasNote: boolean): number {
  const note = hasNote ? TRACKS.noteHeight : 0;
  if (track.kind === 'tally') return TRACKS.tallyHeight + note;
  const rows = track.rows.length;
  return TRACKS.numbersHeight + rows * TRACKS.bandHeight + (rows - 1) * TRACKS.bandGap + note;
}

/** The time columns' left edges and width, for any number of columns. */
export function columns(count: number): { left: number; width: number }[] {
  const span = TABLE.right - TABLE.columnsLeft;
  const width = (span - TABLE.columnGap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) => ({
    left: TABLE.columnsLeft + i * (width + TABLE.columnGap),
    width,
  }));
}

/** Each day's centre and box size, for 1 to 14 days. */
export function days(count: number): { centers: number[]; box: number; number: number } {
  const pitch = TRACKS.daysWidth / count;
  return {
    centers: Array.from({ length: count }, (_, d) => TRACKS.daysLeft + pitch * (d + 0.5)),
    box: Math.min(34, pitch - 10),
    number: Math.min(32, pitch - 6),
  };
}

/**
 * Lays a person's sheet out on pages. Medicine rows fill the first page (with the time
 * headers repeated if they spill over); the tracks follow under a rule, moving to a new
 * page whenever the next one would run into the legend.
 */
export function paginate(sheet: Sheet, notes: readonly boolean[]): FridgePage[] {
  const pages: FridgePage[] = [];
  let page: FridgePage = { rows: [], ruleTop: null, tracks: [] };
  let y: number = TABLE.firstRowTop;

  sheet.rows.forEach((row, index) => {
    const height = rowHeight(row, sheet.rows.length);
    if (page.rows.length > 0 && y + height > LIMIT) {
      pages.push(page);
      page = { rows: [], ruleTop: null, tracks: [] };
      y = TABLE.firstRowTop;
    }
    page.rows.push({ index, top: y, height });
    y += height + TABLE.rowGap;
  });

  const startTracksOnNewPage = () => {
    pages.push(page);
    page = { rows: [], ruleTop: CONTINUED_RULE_TOP, tracks: [] };
    y = CONTINUED_RULE_TOP + TRACKS.fromRule;
  };

  sheet.tracks.forEach((track, index) => {
    const height = trackHeight(track, notes[index] ?? false);
    if (page.ruleTop === null) {
      // The rule and "Tick one box…" only go where tracks follow them.
      const ruleTop = page.rows.length ? y : CONTINUED_RULE_TOP;
      if (page.rows.length && ruleTop + TRACKS.fromRule + height > LIMIT) {
        startTracksOnNewPage();
      } else {
        page.ruleTop = ruleTop;
        y = ruleTop + TRACKS.fromRule;
      }
    } else if (y + height > LIMIT) {
      // A track too tall for an empty continuation page goes there anyway: it can't fit better.
      if (page.tracks.length > 0) startTracksOnNewPage();
    }
    page.tracks.push({ index, top: y, height });
    y += height + TRACKS.gap;
  });

  pages.push(page);
  return pages;
}
