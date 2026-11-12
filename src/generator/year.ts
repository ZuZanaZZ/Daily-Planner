import { daysInMonth } from './calendar';
import { DEFAULT_THEME, MONTH_THEMES } from '../model/themes';
import type { PageContext, PlannerConfig, PlannerPage, TemplateSet, TemplateSlot } from '../model/types';

/**
 * Builds the ordered list of A5 pages for a whole year from the page designs.
 *
 * Page index 0 is a right-hand page (front of the first leaf), so even
 * indexes are right-hand pages and odd indexes are left-hand pages.
 */
export function buildYear(config: PlannerConfig, templates: TemplateSet): PlannerPage[] {
  const pages: PlannerPage[] = [];
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
  push('year', 0);

  for (let m = 0; m < 12; m++) {
    // A spread must start on a left-hand (odd) page so both halves face each other.
    if (pages.length % 2 === 0) push('notes', m === 0 ? 0 : m - 1);
    push('monthCalendar', m);
    push('monthPlan', m);

    for (let d = 1; d <= daysInMonth(config.year, m); d++) {
      push('daily', m, { date: new Date(config.year, m, d) });
    }
  }

  return pages;
}

/** Right-hand pages bind on the left; left-hand pages bind on the right. */
export function sideOf(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'right' : 'left';
}
