import type { ComponentType } from 'react';
import type { PageContext } from '../model/types';
import { Header } from './Header';
import { TodoList } from './TodoList';
import { Notes } from './Notes';
import { MonthCalendar } from './MonthCalendar';

export interface BlockProps<P = Record<string, unknown>> {
  ctx: PageContext;
  props: P;
  widthMm: number;
  heightMm: number;
}

/** Describes an editable property so the editor can build a form for it later. */
export type PropField =
  | { key: string; label: string; kind: 'number'; min: number; max: number; step: number }
  | { key: string; label: string; kind: 'text' }
  | { key: string; label: string; kind: 'boolean' }
  | { key: string; label: string; kind: 'select'; options: string[] };

export interface BlockDef {
  type: string;
  label: string;
  defaultSize: { w: number; h: number };
  defaultProps: Record<string, unknown>;
  fields: PropField[];
  Component: ComponentType<BlockProps<any>>;
}

export const BLOCKS: Record<string, BlockDef> = {
  header: {
    type: 'header',
    label: 'Date header',
    defaultSize: { w: 12, h: 4 },
    defaultProps: { align: 'left' },
    fields: [{ key: 'align', label: 'Align', kind: 'select', options: ['left', 'center', 'right'] }],
    Component: Header,
  },
  todo: {
    type: 'todo',
    label: 'To-do list',
    defaultSize: { w: 6, h: 14 },
    defaultProps: { title: 'To do', spacing: 6, checkboxes: true },
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'spacing', label: 'Line spacing (mm)', kind: 'number', min: 4, max: 12, step: 0.5 },
      { key: 'checkboxes', label: 'Checkboxes', kind: 'boolean' },
    ],
    Component: TodoList,
  },
  notes: {
    type: 'notes',
    label: 'Notes',
    defaultSize: { w: 6, h: 14 },
    defaultProps: { title: 'Notes', style: 'dotted', spacing: 5 },
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'style', label: 'Style', kind: 'select', options: ['lined', 'dotted', 'grid', 'blank'] },
      { key: 'spacing', label: 'Spacing (mm)', kind: 'number', min: 3, max: 10, step: 0.5 },
    ],
    Component: Notes,
  },
  calendar: {
    type: 'calendar',
    label: 'Month calendar',
    defaultSize: { w: 5, h: 8 },
    defaultProps: { size: 'mini' },
    fields: [{ key: 'size', label: 'Size', kind: 'select', options: ['mini', 'large'] }],
    Component: MonthCalendar,
  },
};
