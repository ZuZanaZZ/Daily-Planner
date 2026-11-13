import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { DEFAULT_TEMPLATES } from '../model/defaultTemplates';
import { DEFAULT_NOTES, type NotesSettings, type PlacedBlock, type TemplateSet, type TemplateSlot } from '../model/types';

export interface Settings {
  year: number;
  weekStart: 0 | 1;
  layout: 'a4' | 'a5';
  flip: 'short' | 'long';
  notes: NotesSettings; // extra notes pages after days / weeks / months / at the end
}

export interface State {
  templates: TemplateSet;
  settings: Settings;
}

export type Action =
  | { type: 'addBlock'; slot: TemplateSlot; block: PlacedBlock }
  | { type: 'updateBlock'; slot: TemplateSlot; id: string; patch: Partial<Omit<PlacedBlock, 'id'>> }
  | { type: 'updateProps'; slot: TemplateSlot; id: string; props: Record<string, unknown> }
  | { type: 'removeBlock'; slot: TemplateSlot; id: string }
  | { type: 'resetTemplate'; slot: TemplateSlot }
  | { type: 'setSettings'; settings: Partial<Settings> }
  | { type: 'load'; state: State };

const STORAGE_KEY = 'daily-planner.v1';

function mapBlocks(state: State, slot: TemplateSlot, fn: (blocks: PlacedBlock[]) => PlacedBlock[]): State {
  const t = state.templates[slot];
  return { ...state, templates: { ...state.templates, [slot]: { ...t, blocks: fn(t.blocks) } } };
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
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
  return { ...state, settings: s };
}

const StoreContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function newBlockId(type: string): string {
  return `${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
