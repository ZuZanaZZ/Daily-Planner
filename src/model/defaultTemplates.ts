import type { BlockGroup, Margins, PageTemplate, TemplateSet, TemplateSlot } from './types';

// With the default margins the content area is 38 grid rows (5 mm each) tall.
export const DEFAULT_MARGINS: Margins = { top: 8, bottom: 8, inner: 15, outer: 8 };

/** Sections of the editor's page list. */
export type PageSection = 'cover' | 'year' | 'month' | 'weekly' | 'daily' | 'notes';

// Decides the order of selection buttons.
export const PAGE_SECTIONS: { section: PageSection; label: string }[] = [
  { section: 'cover', label: 'Cover' },
    { section: 'notes', label: 'Notes' },
  { section: 'year', label: 'Yearly' },
  { section: 'month', label: 'Monthly' },
  { section: 'weekly', label: 'Weekly'},
  { section: 'daily', label: 'Daily' },
];

/**
 * Editor metadata for each page design. `group` picks which block palette
 * section opens first; `section` is where the page is listed.
 */
export const SLOTS: {
  slot: TemplateSlot;
  label: string;
  section: PageSection;
  group: BlockGroup;
  side: 'left' | 'right';
}[] = [
  { slot: 'cover', label: 'Cover', section: 'cover', group: 'general', side: 'right' },
  { slot: 'year', label: 'Yearly left', section: 'year', group: 'year', side: 'left' },
  { slot: 'yearPlan', label: 'Yearly right', section: 'year', group: 'year', side: 'right' },
  { slot: 'monthCalendar', label: 'Monthly left', section: 'month', group: 'month', side: 'left' },
  { slot: 'monthPlan', label: 'Monthly right', section: 'month', group: 'month', side: 'right' },
  { slot: 'weekly', label: 'Weekly', section: 'weekly', group: 'general', side: 'right' },
  { slot: 'daily', label: 'Daily', section: 'daily', group: 'daily', side: 'right' },
  { slot: 'notes', label: 'Notes', section: 'notes', group: 'general', side: 'right' },
];

const daily: PageTemplate = {
  id: 'daily',
  name: 'Daily',
  kind: 'daily',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 7, h: 4, props: {} },
    { id: 'w', type: 'weekStrip', x: 7, y: 0, w: 5, h: 4, props: {} },
    { id: 's', type: 'schedule', x: 0, y: 5, w: 6, h: 29, props: {} },
    { id: 'p', type: 'priorities', x: 6, y: 5, w: 6, h: 7, props: {} },
    { id: 't', type: 'todo', x: 6, y: 12, w: 6, h: 14, props: {} },
    { id: 'wa', type: 'water', x: 6, y: 26, w: 6, h: 4, props: {} },
    { id: 'm', type: 'mood', x: 6, y: 30, w: 6, h: 4, props: {} },
    { id: 'n', type: 'notes', x: 0, y: 34, w: 12, h: 4, props: { title: 'Notes', style: 'lined', spacing: 6 } },
  ],
};

const weekly: PageTemplate = {
  id: 'weekly',
  name: 'Weekly',
  kind: 'weekly',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'p', type: 'priorities', x: 0, y: 5, w: 6, h: 7, props: { title: 'Top 3 this week' } },
    { id: 'n', type: 'gratitude', x: 6, y: 5, w: 6, h: 7, props: { title: 'Next week', labels: '1, 2, 3' } },
    { id: 't', type: 'todo', x: 0, y: 13, w: 12, h: 13, props: { title: 'This week' } },
    { id: 'l', type: 'notes', x: 0, y: 28, w: 6, h: 10, props: { title: 'Notes', style: 'lined', spacing: 6 } },
    { id: 'hb', type: 'habitsDaily', x: 6, y: 28, w: 6, h: 6, props: { title: 'Habit review' } },
    { id: 'm', type: 'mood', x: 6, y: 34, w: 6, h: 4, props: { title: 'Mood of the week' } },
  ],
};

const monthCalendar: PageTemplate = {
  id: 'monthCalendar',
  name: 'Monthly · left page',
  kind: 'month-spread',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'c', type: 'calendar', x: 0, y: 4, w: 12, h: 23, props: { size: 'large' } },
    { id: 'g', type: 'notes', x: 0, y: 28, w: 12, h: 10, props: { title: 'Goals', style: 'lined', spacing: 6 } },
  ],
};

const monthPlan: PageTemplate = {
  id: 'monthPlan',
  name: 'Monthly · right page',
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

/** Left page of the year spread. */
const year: PageTemplate = {
  id: 'year',
  name: 'Yearly · left page',
  kind: 'year',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: {} },
    { id: 'y', type: 'yearGrid', x: 0, y: 5, w: 12, h: 33, props: {} },
  ],
};

/** Right page of the year spread. */
const yearPlan: PageTemplate = {
  id: 'yearPlan',
  name: 'Yearly · right page',
  kind: 'year',
  blocks: [
    { id: 'h', type: 'header', x: 0, y: 0, w: 12, h: 4, props: { align: 'right' } },
    { id: 'm', type: 'monthBoxes', x: 0, y: 5, w: 12, h: 33, props: { title: 'Important dates' } },
  ],
};

/** Filler page so month spreads always open on a left-hand page. */
const notes: PageTemplate = {
  id: 'notes',
  name: 'Notes filler',
  kind: 'notes',
  blocks: [{ id: 'n', type: 'notes', x: 0, y: 0, w: 12, h: 38, props: { title: 'Notes', style: 'dotted' } }],
};

export const DEFAULT_TEMPLATES: TemplateSet = { cover, year, yearPlan, monthCalendar, monthPlan, weekly, daily, notes };
