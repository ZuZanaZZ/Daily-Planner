import type { ComponentType } from 'react';
import type { BlockGroup, PageContext } from '../model/types';
import { Header } from './Header';
import { TodoList } from './TodoList';
import { Notes } from './Notes';
import { MonthCalendar } from './MonthCalendar';
import { YearGrid } from './YearGrid';
import { Schedule } from './Schedule';
import { Priorities } from './Priorities';
import { HabitChecklist, LabeledLines, Mood, Water } from './Trackers';
import { WeekStrip } from './WeekStrip';
import { TextBlock } from './TextBlock';
import { HabitTracker, WeekList } from './MonthBlocks';
import { MonthBoxes, YearPixels } from './YearBlocks';

export interface BlockProps<P = Record<string, unknown>> {
  ctx: PageContext;
  props: P;
  widthMm: number;
  heightMm: number;
}

/** Describes an editable property so the editor can build a form for it. */
export type PropField =
  | { key: string; label: string; kind: 'number'; min: number; max: number; step: number }
  | { key: string; label: string; kind: 'text'; hint?: string }
  | { key: string; label: string; kind: 'boolean' }
  | { key: string; label: string; kind: 'select'; options: string[] };

export interface BlockDef {
  type: string;
  label: string;
  icon: string; // name of an outline icon in editor/icons.tsx
  group: BlockGroup;
  defaultSize: { w: number; h: number };
  defaultProps: Record<string, unknown>;
  fields: PropField[];
  Component: ComponentType<BlockProps<any>>;
}

// Reusable field definitions.
const title = (fallback = 'Title'): PropField => ({ key: 'title', label: fallback, kind: 'text' });
const paperStyle: PropField = {
  key: 'style',
  label: 'Paper',
  kind: 'select',
  options: ['lined', 'dotted', 'grid', 'blank'],
};
const listHint = 'Separate with commas';

const defs: BlockDef[] = [
  // --- daily ---
  {
    type: 'schedule',
    label: 'Hourly planner',
    icon: 'clock',
    group: 'daily',
    defaultSize: { w: 6, h: 24 },
    defaultProps: { title: 'Schedule', start: 7, end: 21, half: true, clock: '24h' },
    fields: [
      title(),
      { key: 'start', label: 'First hour', kind: 'number', min: 0, max: 23, step: 1 },
      { key: 'end', label: 'Last hour', kind: 'number', min: 1, max: 24, step: 1 },
      { key: 'half', label: 'Half-hour lines', kind: 'boolean' },
      { key: 'clock', label: 'Clock', kind: 'select', options: ['24h', '12h'] },
    ],
    Component: Schedule,
  },
  {
    type: 'priorities',
    label: 'Top priorities',
    icon: 'star',
    group: 'daily',
    defaultSize: { w: 6, h: 7 },
    defaultProps: { title: 'Top 3', count: 3 },
    fields: [title(), { key: 'count', label: 'How many', kind: 'number', min: 1, max: 10, step: 1 }],
    Component: Priorities,
  },
  {
    type: 'weekStrip',
    label: 'Week strip',
    icon: 'week',
    group: 'daily',
    defaultSize: { w: 5, h: 4 },
    defaultProps: {},
    fields: [],
    Component: WeekStrip,
  },
  {
    type: 'water',
    label: 'Water tracker',
    icon: 'droplet',
    group: 'daily',
    defaultSize: { w: 6, h: 4 },
    defaultProps: { title: 'Water', count: 8 },
    fields: [title(), { key: 'count', label: 'Glasses', kind: 'number', min: 1, max: 16, step: 1 }],
    Component: Water,
  },
  {
    type: 'mood',
    label: 'Mood',
    icon: 'smile',
    group: 'daily',
    defaultSize: { w: 6, h: 4 },
    defaultProps: { title: 'Mood' },
    fields: [title()],
    Component: Mood,
  },
  {
    type: 'meals',
    label: 'Meals',
    icon: 'utensils',
    group: 'daily',
    defaultSize: { w: 6, h: 9 },
    defaultProps: { title: 'Meals', labels: 'Breakfast, Lunch, Dinner, Snacks' },
    fields: [title(), { key: 'labels', label: 'Rows', kind: 'text', hint: listHint }],
    Component: LabeledLines,
  },
  {
    type: 'gratitude',
    label: 'Gratitude',
    icon: 'heart',
    group: 'daily',
    defaultSize: { w: 6, h: 6 },
    defaultProps: { title: 'Grateful for', labels: '1, 2, 3' },
    fields: [title(), { key: 'labels', label: 'Rows', kind: 'text', hint: listHint }],
    Component: LabeledLines,
  },
  {
    type: 'habitsDaily',
    label: 'Habit checklist',
    icon: 'checkbox',
    group: 'daily',
    defaultSize: { w: 6, h: 5 },
    defaultProps: { title: 'Habits', habits: 'Exercise, Read, Vitamins, Stretch', columns: 2 },
    fields: [
      title(),
      { key: 'habits', label: 'Habits', kind: 'text', hint: listHint },
      { key: 'columns', label: 'Columns', kind: 'number', min: 1, max: 3, step: 1 },
    ],
    Component: HabitChecklist,
  },

  // --- month ---
  {
    type: 'habitTracker',
    label: 'Habit tracker',
    icon: 'tracker',
    group: 'month',
    defaultSize: { w: 12, h: 12 },
    defaultProps: { title: 'Habit tracker', habits: 'Exercise, Read, Water, Sleep 8h', rows: 8 },
    fields: [
      title(),
      { key: 'habits', label: 'Habits', kind: 'text', hint: listHint },
      { key: 'rows', label: 'Rows', kind: 'number', min: 1, max: 20, step: 1 },
    ],
    Component: HabitTracker,
  },
  {
    type: 'weekList',
    label: 'Weekly focus',
    icon: 'list',
    group: 'month',
    defaultSize: { w: 6, h: 16 },
    defaultProps: { title: 'Weekly focus' },
    fields: [title()],
    Component: WeekList,
  },

  // --- year ---
  {
    type: 'yearGrid',
    label: 'Year at a glance',
    icon: 'yearGrid',
    group: 'year',
    defaultSize: { w: 12, h: 30 },
    defaultProps: {},
    fields: [],
    Component: YearGrid,
  },
  {
    type: 'yearPixels',
    label: 'Year in pixels',
    icon: 'pixels',
    group: 'year',
    defaultSize: { w: 8, h: 32 },
    defaultProps: { title: 'Year in pixels' },
    fields: [title()],
    Component: YearPixels,
  },
  {
    type: 'monthBoxes',
    label: 'Month boxes',
    icon: 'boxes',
    group: 'year',
    defaultSize: { w: 12, h: 30 },
    defaultProps: { title: 'Birthdays & events', columns: 3, style: 'lined' },
    fields: [title(), { key: 'columns', label: 'Columns', kind: 'number', min: 1, max: 4, step: 1 }, paperStyle],
    Component: MonthBoxes,
  },

  // --- general ---
  {
    type: 'header',
    label: 'Date header',
    icon: 'heading',
    group: 'general',
    defaultSize: { w: 12, h: 4 },
    defaultProps: { align: 'left' },
    fields: [{ key: 'align', label: 'Align', kind: 'select', options: ['left', 'center', 'right'] }],
    Component: Header,
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'text',
    group: 'general',
    defaultSize: { w: 6, h: 2 },
    defaultProps: { text: 'Today I will…', size: 3.5, align: 'left', style: 'plain' },
    fields: [
      { key: 'text', label: 'Text', kind: 'text' },
      { key: 'size', label: 'Font size (mm)', kind: 'number', min: 2, max: 20, step: 0.5 },
      { key: 'align', label: 'Align', kind: 'select', options: ['left', 'center', 'right'] },
      { key: 'style', label: 'Style', kind: 'select', options: ['plain', 'banner', 'outline'] },
    ],
    Component: TextBlock,
  },
  {
    type: 'todo',
    label: 'To-do list',
    icon: 'todo',
    group: 'general',
    defaultSize: { w: 6, h: 14 },
    defaultProps: { title: 'To do', spacing: 6, checkboxes: true },
    fields: [
      title(),
      { key: 'spacing', label: 'Line spacing (mm)', kind: 'number', min: 4, max: 12, step: 0.5 },
      { key: 'checkboxes', label: 'Checkboxes', kind: 'boolean' },
    ],
    Component: TodoList,
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: 'notes',
    group: 'general',
    defaultSize: { w: 6, h: 14 },
    defaultProps: { title: 'Notes', style: 'dotted', spacing: 5 },
    fields: [
      title(),
      paperStyle,
      { key: 'spacing', label: 'Spacing (mm)', kind: 'number', min: 3, max: 10, step: 0.5 },
    ],
    Component: Notes,
  },
  {
    type: 'calendar',
    label: 'Month calendar',
    icon: 'calendar',
    group: 'general',
    defaultSize: { w: 5, h: 8 },
    defaultProps: { size: 'mini' },
    fields: [{ key: 'size', label: 'Size', kind: 'select', options: ['mini', 'large'] }],
    Component: MonthCalendar,
  },
];

export const BLOCKS: Record<string, BlockDef> = Object.fromEntries(defs.map((d) => [d.type, d]));

export const BLOCK_LIST: BlockDef[] = defs;
