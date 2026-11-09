import { daysInMonth } from './calendar';
import {
  COVER_TEMPLATE,
  DAILY_TEMPLATE,
  MONTH_PLAN_TEMPLATE,
  MONTH_TEMPLATE,
  NOTES_TEMPLATE,
  YEAR_TEMPLATE,
} from '../model/defaultTemplates';
import { DEFAULT_THEME, MONTH_THEMES } from '../model/themes';
import type { PageContext, PageKind, PageTemplate, PlannerConfig, PlannerPage } from '../model/types';

/**
 * Builds the ordered list of A5 pages for a whole year.
 *
 * Page index 0 is a right-hand page (front of the first leaf), so even
 * indexes are right-hand pages and odd indexes are left-hand pages.
 */
export function buildYear(config: PlannerConfig): PlannerPage[] {
  const pages: PlannerPage[] = [];
  const base = { year: config.year, weekStart: config.weekStart, locale: config.locale };

  const push = (template: PageTemplate, kind: PageKind, month: number, extra: Partial<PageContext> = {}) => {
    const theme = kind === 'cover' || kind === 'year' ? DEFAULT_THEME : MONTH_THEMES[month];
    pages.push({
      key: `${kind}-${month}-${extra.date?.getDate() ?? ''}-${pages.length}`,
      template,
      ctx: { ...base, kind, month, theme, ...extra },
    });
  };

  push(COVER_TEMPLATE, 'cover', 0);
  push(YEAR_TEMPLATE, 'year', 0);

  for (let m = 0; m < 12; m++) {
    // A spread must start on a left-hand (odd) page so both halves face each other.
    if (pages.length % 2 === 0) push(NOTES_TEMPLATE, 'notes', m === 0 ? 0 : m - 1);
    push(MONTH_TEMPLATE, 'month-spread', m);
    push(MONTH_PLAN_TEMPLATE, 'month-plan', m);

    for (let d = 1; d <= daysInMonth(config.year, m); d++) {
      push(DAILY_TEMPLATE, 'daily', m, { date: new Date(config.year, m, d) });
    }
  }

  return pages;
}

/** Right-hand pages bind on the left; left-hand pages bind on the right. */
export function sideOf(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'right' : 'left';
}
