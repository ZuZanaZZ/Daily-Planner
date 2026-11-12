import type { BlockGroup, Margins, PageTemplate, TemplateSet, TemplateSlot } from './types';

// With the default margins the content area is 38 grid rows (5 mm each) tall.
export const DEFAULT_MARGINS: Margins = { top: 8, bottom: 8, inner: 15, outer: 8 };

/** Editor metadata for each page design. */
export const SLOTS: { slot: TemplateSlot; label: string; group: BlockGroup; side: 'left' | 'right' }[] = [
  { slot: 'cover', label: 'Cover', group: 'year', side: 'right' },
  { slot: 'year', label: 'Year overview', group: 'year', side: 'left' },
  { slot: 'monthCalendar', label: 'Month · left page', group: 'month', side: 'left' },
  { slot: 'monthPlan', label: 'Month · right page', group: 'month', side: 'right' },
  { slot: 'daily', label: 'Daily page', group: 'daily', side: 'right' },
  { slot: 'notes', label: 'Notes filler', group: 'general', side: 'right' },
];

const daily: PageTemplate = {
  id: 'daily',
  name: 'Daily',
  kind: 'daily',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 7, h: 5, props: {} },
    { id: 'w', type: 'weekStrip', x: 7, y: 0, w: 5, h: 5, props: {} },
    { id: 's', type: 'schedule', x: 0, y: 6, w: 6, h: 28, props: {} },
    { id: 'p', type: 'priorities', x: 6, y: 6, w: 6, h: 7, props: {} },
    { id: 't', type: 'todo', x: 6, y: 13, w: 6, h: 13, props: {} },
    { id: 'wa', type: 'water', x: 6, y: 26, w: 6, h: 4, props: {} },
    { id: 'm', type: 'mood', x: 6, y: 30, w: 6, h: 4, props: {} },
    { id: 'n', type: 'notes', x: 0, y: 34, w: 12, h: 4, props: { title: 'Notes', style: 'lined', spacing: 6 } },
  ],
};

const monthCalendar: PageTemplate = {
  id: 'monthCalendar',
  name: 'Month · left page',
  kind: 'month-spread',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'c', type: 'calendar', x: 0, y: 4, w: 12, h: 23, props: { size: 'large' } },
    { id: 'g', type: 'notes', x: 0, y: 28, w: 12, h: 10, props: { title: 'Goals', style: 'lined', spacing: 6 } },
  ],
};

const monthPlan: PageTemplate = {
  id: 'monthPlan',
  name: 'Month · right page',
  kind: 'month-plan',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: { align: 'right' } },
    { id: 'ht', type: 'habitTracker', x: 0, y: 5, w: 12, h: 13, props: {} },
    { id: 'wf', type: 'weekList', x: 0, y: 19, w: 6, h: 19, props: {} },
    { id: 't', type: 'todo', x: 6, y: 19, w: 6, h: 19, props: { title: 'Month to do' } },
  ],
};

const cover: PageTemplate = {
  id: 'cover',
  name: 'Cover',
  kind: 'cover',
  blocks: [{ id: 'h', type: 'header', x: 0, y: 14, w: 12, h: 8, props: { align: 'center' } }],
};

const year: PageTemplate = {
  id: 'year',
  name: 'Year overview',
  kind: 'year',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'y', type: 'yearGrid', x: 0, y: 5, w: 12, h: 33, props: {} },
  ],
};

/** Filler page so month spreads always open on a left-hand page. */
const notes: PageTemplate = {
  id: 'notes',
  name: 'Notes filler',
  kind: 'notes',
  blocks: [{ id: 'n', type: 'notes', x: 0, y: 0, w: 12, h: 38, props: { title: 'Notes', style: 'dotted' } }],
};

export const DEFAULT_TEMPLATES: TemplateSet = { cover, year, monthCalendar, monthPlan, daily, notes };
