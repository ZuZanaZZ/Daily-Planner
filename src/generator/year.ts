import { daysInMonth } from './calendar';
import { DEFAULT_THEME, MONTH_THEMES } from '../model/themes';
import type {
  NotesPlacement,
  PageContext,
  PlannerConfig,
  PlannerPage,
  TemplateSet,
  TemplateSlot,
} from '../model/types';

/**
 * Builds the ordered list of A5 pages for a whole year from the page designs.
 *
 * Page index 0 is a right-hand page (front of the first leaf), so even
 * indexes are right-hand pages and odd indexes are left-hand pages.
 */
export function buildYear(config: PlannerConfig, templates: TemplateSet): PlannerPage[] {
  const pages: PlannerPage[] = [];
  /** How many notes pages go at a spot (0 when that option is unticked). */
  const notesAt = (p: NotesPlacement) => {
    const n = config.notes[p];
    return n.enabled ? Math.max(0, Math.min(100, Math.floor(Number(n.count) || 0))) : 0;
  };
  const lastDayOfWeek = (config.weekStart + 6) % 7;
  const base = { year: config.year, weekStart: config.weekStart, locale: config.locale };

  const push = (slot: TemplateSlot, month: number, extra: Partial<PageContext> = {}) => {
    const template = templates[slot];
    const kind = template.kind;
    const theme = kind === 'cover' || kind === 'year' ? DEFAULT_THEME : MONTH_THEMES[month];
    pages.push({
      key: `${slot}-${month}-${extra.date?.getDate() ?? ''}-${pages.length}`,
      template,
      ctx: { ...base, kind, month, theme, ...extra },
    });
  };

  push('cover', 0);
  // Year spread: cover is page 0 (right), so this lands on pages 1-2 facing each other.
  push('year', 0);
  push('yearPlan', 0);

  for (let m = 0; m < 12; m++) {
    // Double-sided: a spread must start on a left-hand (odd) page so both halves
    // face each other. Single-sided pages never face each other, so no filler.
    if (config.sides === 'double' && pages.length % 2 === 0) push('notes', m === 0 ? 0 : m - 1);
    push('monthCalendar', m);
    push('monthPlan', m);

    const days = daysInMonth(config.year, m);
    for (let d = 1; d <= days; d++) {
      const date = new Date(config.year, m, d);
      push('daily', m, { date });
      for (let i = 0; i < notesAt('day'); i++) push('notes', m);

      // A week ends on its last weekday; the final days of the year close the last week.
      const endOfWeek = date.getDay() === lastDayOfWeek || (m === 11 && d === days);
      if (endOfWeek) for (let i = 0; i < notesAt('week'); i++) push('notes', m);
    }

    for (let i = 0; i < notesAt('month'); i++) push('notes', m);
  }

  for (let i = 0; i < notesAt('end'); i++) push('notes', 11, { theme: DEFAULT_THEME });

  return pages;
}

/**
 * Right-hand pages bind on the left; left-hand pages bind on the right.
 * Single-sided, every page is a right-hand page (rings always on the left).
 */
export function sideOf(index: number, sides: 'double' | 'single' = 'double'): 'left' | 'right' {
  if (sides === 'single') return 'right';
  return index % 2 === 0 ? 'right' : 'left';
}
