import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { DEFAULT_TEMPLATES } from '../model/defaultTemplates';
import { DEFAULT_NOTES, type NotesSettings, type PlacedBlock, type TemplateSet, type TemplateSlot } from '../model/types';

export interface Settings {
  year: number;
  weekStart: 0 | 1;
  layout: 'a4' | 'a5';
  flip: 'short' | 'long';
  sides: 'double' | 'single';
  notes: NotesSettings; // extra notes pages after days / weeks / months / at the end
}

export interface State {
  templates: TemplateSet;
  settings: Settings;
}

/**
 * `group`: consecutive actions with the same group form ONE undo step
 * (e.g. every position update during a single drag, or typing a title).
 */
export type Action =
  | { type: 'addBlock'; slot: TemplateSlot; block: PlacedBlock; group?: string }
  | { type: 'updateBlock'; slot: TemplateSlot; id: string; patch: Partial<Omit<PlacedBlock, 'id'>>; group?: string }
  | { type: 'updateProps'; slot: TemplateSlot; id: string; props: Record<string, unknown>; group?: string }
  | { type: 'removeBlock'; slot: TemplateSlot; id: string; group?: string }
  | { type: 'resetTemplate'; slot: TemplateSlot; group?: string }
  | { type: 'setSettings'; settings: Partial<Settings> }
  | { type: 'load'; state: State; group?: string }
  | { type: 'undo' }
  | { type: 'redo' };

/** How many design changes can be undone. */
export const UNDO_LIMIT = 10;

const STORAGE_KEY = 'daily-planner.v1';

function mapBlocks(state: State, slot: TemplateSlot, fn: (blocks: PlacedBlock[]) => PlacedBlock[]): State {
  const t = state.templates[slot];
  return { ...state, templates: { ...state.templates, [slot]: { ...t, blocks: fn(t.blocks) } } };
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'undo':
    case 'redo':
      return state; // handled by historyReducer
    case 'addBlock':
      return mapBlocks(state, a.slot, (bs) => [...bs, a.block]);
    case 'updateBlock':
      return mapBlocks(state, a.slot, (bs) => bs.map((b) => (b.id === a.id ? { ...b, ...a.patch } : b)));
    case 'updateProps':
      return mapBlocks(state, a.slot, (bs) =>
        bs.map((b) => (b.id === a.id ? { ...b, props: { ...b.props, ...a.props } } : b)),
      );
    case 'removeBlock':
      return mapBlocks(state, a.slot, (bs) => bs.filter((b) => b.id !== a.id));
    case 'resetTemplate':
      return { ...state, templates: { ...state.templates, [a.slot]: DEFAULT_TEMPLATES[a.slot] } };
    case 'setSettings':
      return { ...state, settings: { ...state.settings, ...a.settings } };
    case 'load':
      return a.state;
  }
}

/**
 * Undo history. Only the page designs are recorded; settings (year, printing,
 * notes pages) aren't undone, like Canva where undo is about the design.
 */
interface History {
  present: State;
  past: TemplateSet[]; // oldest first
  future: TemplateSet[]; // next redo first
  lastGroup: string | null;
}

function historyReducer(h: History, a: Action): History {
  if (a.type === 'undo') {
    const prev = h.past[h.past.length - 1];
    if (!prev) return h;
    return {
      present: { ...h.present, templates: prev },
      past: h.past.slice(0, -1),
      future: [h.present.templates, ...h.future],
      lastGroup: null,
    };
  }
  if (a.type === 'redo') {
    const next = h.future[0];
    if (!next) return h;
    return {
      present: { ...h.present, templates: next },
      past: [...h.past, h.present.templates].slice(-UNDO_LIMIT),
      future: h.future.slice(1),
      lastGroup: null,
    };
  }

  const present = reducer(h.present, a);
  if (present.templates === h.present.templates) return { ...h, present }; // settings only: not an undo step

  const group = 'group' in a ? (a.group ?? null) : null;
  const sameStep = group !== null && group === h.lastGroup;
  return {
    present,
    past: sameStep ? h.past : [...h.past, h.present.templates].slice(-UNDO_LIMIT),
    future: [],
    lastGroup: group,
  };
}

/** Accepts saved data (localStorage or a design file), filling in anything missing. */
export function normalizeState(raw: unknown, fallback: State): State {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<State>;
  const templates = { ...fallback.templates };
  for (const slot of Object.keys(templates) as TemplateSlot[]) {
    const t = r.templates?.[slot];
    if (t && Array.isArray(t.blocks)) templates[slot] = { ...templates[slot], blocks: t.blocks };
  }
  const settings = { ...fallback.settings, ...(r.settings ?? {}) };
  // Merge notes options one by one so older saves (without some of them) still load.
  const savedNotes = (r.settings?.notes ?? {}) as Partial<NotesSettings>;
  settings.notes = { ...fallback.settings.notes };
  for (const key of Object.keys(settings.notes) as (keyof NotesSettings)[]) {
    settings.notes[key] = { ...settings.notes[key], ...(savedNotes[key] ?? {}) };
  }
  return { templates, settings };
}

function initialState(): State {
  const params = new URLSearchParams(window.location.search);
  const fallback: State = {
    templates: DEFAULT_TEMPLATES,
    settings: {
      year: new Date().getFullYear() + 1,
      weekStart: 1,
      layout: 'a4',
      flip: 'short',
      sides: 'double',
      notes: DEFAULT_NOTES,
    },
  };
  let state = fallback;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = normalizeState(JSON.parse(saved), fallback);
  } catch {
    // Ignore broken saved data and start fresh.
  }
  // URL parameters override saved settings, e.g. ?year=2027&layout=a5
  const s = { ...state.settings };
  if (Number(params.get('year'))) s.year = Number(params.get('year'));
  if (params.get('weekStart')) s.weekStart = params.get('weekStart') === '0' ? 0 : 1;
  if (params.get('layout')) s.layout = params.get('layout') === 'a5' ? 'a5' : 'a4';
  if (params.get('flip')) s.flip = params.get('flip') === 'long' ? 'long' : 'short';
  if (params.get('sides')) s.sides = params.get('sides') === 'single' ? 'single' : 'double';
  return { ...state, settings: s };
}

interface StoreValue {
  state: State;
  dispatch: Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    present: initialState(),
    past: [],
    future: [],
    lastGroup: null,
  }));
  const state = history.present;

  // Only the current design is saved; the undo history lasts for this session.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({ state, dispatch, canUndo: history.past.length > 0, canRedo: history.future.length > 0 }),
    [state, history.past.length, history.future.length],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function newBlockId(type: string): string {
  return `${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
