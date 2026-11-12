// Page geometry is in millimetres so the screen preview matches the print.
export const PAGE = {
  width: 148, // A5
  height: 210,
};

/** Snap grid used for laying out blocks inside the page content area. */
export const GRID = {
  cols: 12,
  rowMm: 5,
  gapMm: 2, // horizontal gap between columns
};

export interface Margins {
  top: number;
  bottom: number;
  inner: number; // binding side (ring holes)
  outer: number;
}

/** Number of grid rows that fit in the content area. */
export function contentRows(m: Margins): number {
  return Math.floor((PAGE.height - m.top - m.bottom) / GRID.rowMm);
}

export function contentWidthMm(m: Margins): number {
  return PAGE.width - m.inner - m.outer;
}

export interface Theme {
  name: string;
  primary: string; // headings, accents
  accent: string; // highlights, checkboxes
  soft: string; // light fills
  line: string; // ruling lines
  text: string;
  paper: string;
  font: string;
}

export type PageKind = 'cover' | 'year' | 'month-spread' | 'month-plan' | 'daily' | 'notes';

/** Which palette section a block belongs to. */
export type BlockGroup = 'daily' | 'month' | 'year' | 'general';

/** A block placed on the page grid, in grid units. */
export interface PlacedBlock {
  id: string;
  type: string; // key into the block registry
  x: number;
  y: number;
  w: number;
  h: number;
  props: Record<string, unknown>;
}

export interface PageTemplate {
  id: string;
  name: string;
  kind: PageKind;
  blocks: PlacedBlock[];
}

/** The editable page designs that make up a planner. */
export type TemplateSlot = 'cover' | 'year' | 'monthCalendar' | 'monthPlan' | 'daily' | 'notes';
export type TemplateSet = Record<TemplateSlot, PageTemplate>;

export interface PlannerConfig {
  year: number;
  weekStart: 0 | 1;
  locale: string;
  margins: Margins;
}

/** One concrete A5 page of the generated planner. */
export interface PlannerPage {
  key: string;
  template: PageTemplate;
  ctx: PageContext;
}

/** Date information handed to every block while rendering a concrete page. */
export interface PageContext {
  kind: PageKind;
  year: number;
  month: number; // 0-11
  date?: Date; // set for daily pages
  weekStart: 0 | 1; // 0 = Sunday, 1 = Monday
  locale: string;
  theme: Theme;
}
