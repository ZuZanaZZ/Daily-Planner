import { useEffect, useState } from 'react';
import { BLOCKS } from '../blocks/registry';
import { monthName } from '../generator/calendar';
import { DEFAULT_MARGINS, SLOTS } from '../model/defaultTemplates';
import { DEFAULT_THEME, MONTH_THEMES } from '../model/themes';
import { contentRows, GRID, type BlockGroup, type PageContext, type TemplateSlot } from '../model/types';
import { newBlockId, useStore } from '../state/store';
import { BlockPalette } from './BlockPalette';
import { EditorCanvas } from './EditorCanvas';
import { clamp, findFreeSpot } from './layout';
import { PropertiesPanel } from './PropertiesPanel';

const LOCALE = 'en-GB';
const SAMPLE_DAY = 14;

const PAGE_GROUPS: { group: BlockGroup; label: string }[] = [
  { group: 'year', label: 'Year' },
  { group: 'month', label: 'Month' },
  { group: 'daily', label: 'Daily' },
  { group: 'general', label: 'Other' },
];

export function Editor() {
  const { state, dispatch } = useStore();
  const [slot, setSlot] = useState<TemplateSlot>('daily');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [month, setMonth] = useState(0);
  const [zoom, setZoom] = useState(1);

  const info = SLOTS.find((s) => s.slot === slot)!;
  const template = state.templates[slot];
  const selected = template.blocks.find((b) => b.id === selectedId) ?? null;
  const rows = contentRows(DEFAULT_MARGINS);
  const { year, weekStart } = state.settings;

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

  // Keyboard shortcuts for the selected block.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (!selected || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
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
        <h3>Pages</h3>
        <div className="ed-pages">
          {PAGE_GROUPS.map(({ group, label }) => (
            <div key={group} className="ed-pages__group">
              <span className="ed-pages__label">{label}</span>
              {SLOTS.filter((s) => s.group === group).map((s) => (
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
            </div>
          ))}
        </div>
        <h3>Blocks</h3>
        <BlockPalette key={info.group} group={info.group} onAdd={addBlock} />
      </aside>

      <section className="ed-stage">
        <div className="ed-stage__bar">
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
            side={info.side}
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
