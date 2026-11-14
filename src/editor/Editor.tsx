import { useEffect, useState } from 'react';
import { BLOCKS } from '../blocks/registry';
import { monthName } from '../generator/calendar';
import { DEFAULT_MARGINS, PAGE_SECTIONS, SLOTS } from '../model/defaultTemplates';
import { DEFAULT_THEME, MONTH_THEMES } from '../model/themes';
import { contentRows, GRID, type PageContext, type TemplateSlot } from '../model/types';
import { newBlockId, useStore } from '../state/store';
import { NotesFields } from '../components/NotesFields';
import { PlannerFields } from '../components/PlannerFields';
import { BlockPalette } from './BlockPalette';
import { BlockIcon } from './icons';
import { EditorCanvas } from './EditorCanvas';
import { clamp, findFreeSpot } from './layout';
import { PropertiesPanel } from './PropertiesPanel';

const LOCALE = 'en-GB';
const SAMPLE_DAY = 14;

export function Editor() {
  const { state, dispatch, canUndo, canRedo } = useStore();
  const [slot, setSlot] = useState<TemplateSlot>('daily');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [month, setMonth] = useState(0);
  const [zoom, setZoom] = useState(1);

  const info = SLOTS.find((s) => s.slot === slot)!;
  const template = state.templates[slot];
  const selected = template.blocks.find((b) => b.id === selectedId) ?? null;
  const rows = contentRows(DEFAULT_MARGINS);
  const { year, weekStart, sides } = state.settings;

  const kind = template.kind;
  const ctx: PageContext = {
    kind,
    year,
    month,
    weekStart,
    locale: LOCALE,
    theme: kind === 'cover' || kind === 'year' ? DEFAULT_THEME : MONTH_THEMES[month],
    date: kind === 'daily' ? new Date(year, month, SAMPLE_DAY) : undefined,
  };

  const addBlock = (type: string) => {
    const def = BLOCKS[type];
    const w = Math.min(def.defaultSize.w, GRID.cols);
    const h = Math.min(def.defaultSize.h, rows);
    const block = { id: newBlockId(type), type, ...findFreeSpot(template.blocks, w, h, rows), w, h, props: {} };
    dispatch({ type: 'addBlock', slot, block });
    setSelectedId(block.id);
  };

  // Keyboard shortcuts: undo/redo, and moving/resizing/deleting the selected block.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      // While typing in a field, leave keys (incl. the browser's own text undo) alone.
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        dispatch({ type: 'redo' });
        return;
      }

      if (!selected) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        dispatch({ type: 'removeBlock', slot, id: selected.id });
        setSelectedId(null);
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') return setSelectedId(null);
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      const patch = e.shiftKey
        ? { w: clamp(selected.w + d[0], 1, GRID.cols - selected.x), h: clamp(selected.h + d[1], 1, rows - selected.y) }
        : { x: clamp(selected.x + d[0], 0, GRID.cols - selected.w), y: clamp(selected.y + d[1], 0, rows - selected.h) };
      dispatch({ type: 'updateBlock', slot, id: selected.id, patch });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, slot, rows, dispatch]);

  return (
    <div className="editor">
      <aside className="ed-sidebar">
        <h3>Planner</h3>
        <PlannerFields />
        <h3>Pages</h3>
        <div className="ed-pages">
          {PAGE_SECTIONS.map(({ section, label }) => (
            <div key={section} className="ed-pages__group">
              <span className="ed-pages__label">{label}</span>
              {SLOTS.filter((s) => s.section === section).map((s) => (
                <button
                  key={s.slot}
                  className={s.slot === slot ? 'is-active' : ''}
                  onClick={() => {
                    setSlot(s.slot);
                    setSelectedId(null);
                  }}
                >
                  {s.label}
                </button>
              ))}
              {section === 'notes' && slot === 'notes' && (
                <>
                  <NotesFields />
                  <p className="ed-hint">The number is how many notes pages go in each spot.</p>
                </>
              )}
            </div>
          ))}
        </div>
        <h3>Blocks</h3>
        <BlockPalette key={info.group} group={info.group} onAdd={addBlock} />
      </aside>

      <section className="ed-stage">
        <div className="ed-stage__bar">
          <div className="ed-history">
            <button
              className="ed-history__btn"
              onClick={() => dispatch({ type: 'undo' })}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <BlockIcon name="undo" size={18} />
            </button>
            <button
              className="ed-history__btn"
              onClick={() => dispatch({ type: 'redo' })}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <BlockIcon name="redo" size={18} />
            </button>
          </div>
          <label>
            Preview month
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, m) => (
                <option key={m} value={m}>
                  {monthName(LOCALE, m)} — {MONTH_THEMES[m].name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zoom
            <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
              {[0.75, 1, 1.25, 1.5].map((z) => (
                <option key={z} value={z}>
                  {z * 100}%
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="ed-stage__scroll" onPointerDown={() => setSelectedId(null)}>
          <EditorCanvas
            slot={slot}
            ctx={ctx}
            side={sides === 'single' ? 'right' : info.side}
            zoom={zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </section>

      <aside className="ed-sidebar ed-sidebar--right">
        <PropertiesPanel slot={slot} block={selected} onSelect={setSelectedId} />
      </aside>
    </div>
  );
}
