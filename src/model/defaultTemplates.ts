import type { Margins, PageTemplate } from './types';

// With the default margins the content area is 38 grid rows (5 mm each) tall.
export const DEFAULT_MARGINS: Margins = { top: 8, bottom: 8, inner: 15, outer: 8 };

export const DAILY_TEMPLATE: PageTemplate = {
  id: 'daily-default',
  name: 'Daily',
  kind: 'daily',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 8, h: 6, props: {} },
    { id: 'c', type: 'calendar', x: 8, y: 0, w: 4, h: 7, props: { size: 'mini' } },
    { id: 't', type: 'todo', x: 0, y: 8, w: 6, h: 16, props: { title: 'To do' } },
    { id: 'p', type: 'notes', x: 6, y: 8, w: 6, h: 16, props: { title: 'Priorities', style: 'lined', spacing: 6 } },
    { id: 'n', type: 'notes', x: 0, y: 25, w: 12, h: 13, props: { title: 'Notes', style: 'dotted' } },
  ],
};

/** Left page of the month spread. */
export const MONTH_TEMPLATE: PageTemplate = {
  id: 'month-default',
  name: 'Month spread',
  kind: 'month-spread',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'c', type: 'calendar', x: 0, y: 4, w: 12, h: 23, props: { size: 'large' } },
    { id: 'g', type: 'notes', x: 0, y: 28, w: 12, h: 10, props: { title: 'Goals', style: 'lined', spacing: 6 } },
  ],
};

/** Right page of the month spread. */
export const MONTH_PLAN_TEMPLATE: PageTemplate = {
  id: 'month-plan-default',
  name: 'Month plan',
  kind: 'month-plan',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: { align: 'right' } },
    { id: 't', type: 'todo', x: 0, y: 5, w: 6, h: 20, props: { title: 'Month to do' } },
    { id: 'i', type: 'notes', x: 6, y: 5, w: 6, h: 20, props: { title: 'Important dates', style: 'lined', spacing: 6 } },
    { id: 'n', type: 'notes', x: 0, y: 26, w: 12, h: 12, props: { title: 'Notes', style: 'dotted' } },
  ],
};

export const COVER_TEMPLATE: PageTemplate = {
  id: 'cover-default',
  name: 'Cover',
  kind: 'cover',
  blocks: [{ id: 'h', type: 'header', x: 0, y: 14, w: 12, h: 8, props: { align: 'center' } }],
};

export const YEAR_TEMPLATE: PageTemplate = {
  id: 'year-default',
  name: 'Year at a glance',
  kind: 'year',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'y', type: 'yearGrid', x: 0, y: 5, w: 12, h: 33, props: {} },
  ],
};

/** Filler page so month spreads always open on a left-hand page. */
export const NOTES_TEMPLATE: PageTemplate = {
  id: 'notes-default',
  name: 'Notes',
  kind: 'notes',
  blocks: [{ id: 'n', type: 'notes', x: 0, y: 0, w: 12, h: 38, props: { title: 'Notes', style: 'dotted' } }],
};
