import { useEffect, useMemo, useRef, useState } from 'react';
import { YearView } from './components/YearView';
import { Editor } from './editor/Editor';
import { buildYear } from './generator/year';
import { DEFAULT_MARGINS, DEFAULT_TEMPLATES } from './model/defaultTemplates';
import { normalizeState, useStore } from './state/store';

const LOCALE = 'en-GB';
const params = new URLSearchParams(window.location.search);

export function App() {
  const { state, dispatch } = useStore();
  const { year, weekStart, layout, flip } = state.settings;
  const [view, setView] = useState<'editor' | 'year'>(params.get('view') === 'year' ? 'year' : 'editor');
  const [printing, setPrinting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const pages = useMemo(
    () => buildYear({ year, weekStart, locale: LOCALE, margins: DEFAULT_MARGINS }, state.templates),
    [year, weekStart, state.templates],
  );

  // Render the full year first, then open the print dialog.
  useEffect(() => {
    if (!printing) return;
    window.print();
    setPrinting(false);
  }, [printing]);

  const saveDesign = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `planner-design.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const loadDesign = async (file: File) => {
    try {
      const loaded = normalizeState(JSON.parse(await file.text()), {
        templates: DEFAULT_TEMPLATES,
        settings: state.settings,
      });
      // Keep the currently chosen year; designs are reusable across years.
      dispatch({ type: 'load', state: { ...loaded, settings: { ...loaded.settings, year } } });
    } catch {
      alert('That file is not a planner design.');
    }
  };

  const sheetCount = Math.ceil(pages.length / 4);
  const showYear = view === 'year' || printing;

  return (
    <div className="app">
      <header className="toolbar no-print">
        <h1>Daily Planner</h1>
        <div className="toggle">
          <button className={view === 'editor' ? 'is-active' : ''} onClick={() => setView('editor')}>
            Editor
          </button>
          <button className={view === 'year' ? 'is-active' : ''} onClick={() => setView('year')}>
            Whole year
          </button>
        </div>
        <label>
          Year
          <input
            type="number"
            value={year}
            onChange={(e) => dispatch({ type: 'setSettings', settings: { year: Number(e.target.value) || year } })}
          />
        </label>
        <label>
          Week starts
          <select
            value={weekStart}
            onChange={(e) => dispatch({ type: 'setSettings', settings: { weekStart: Number(e.target.value) as 0 | 1 } })}
          >
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
        <label>
          Print on
          <select
            value={layout}
            onChange={(e) => dispatch({ type: 'setSettings', settings: { layout: e.target.value as 'a4' | 'a5' } })}
          >
            <option value="a4">A4, 2 pages per side (cut & stack)</option>
            <option value="a5">A5 paper, 1 page per side</option>
          </select>
        </label>
        {layout === 'a4' && (
          <label>
            Duplex flip
            <select
              value={flip}
              onChange={(e) =>
                dispatch({ type: 'setSettings', settings: { flip: e.target.value as 'short' | 'long' } })
              }
            >
              <option value="short">Short edge</option>
              <option value="long">Long edge</option>
            </select>
          </label>
        )}
        <div className="toolbar__end">
          <button onClick={saveDesign} title="Download your page designs to reuse later">
            Save design
          </button>
          <button onClick={() => fileInput.current?.click()} title="Load a saved design file">
            Load design
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadDesign(f);
              e.target.value = '';
            }}
          />
          <span className="toolbar__info">
            {pages.length} pages{layout === 'a4' ? ` · ${sheetCount} A4 sheets` : ''}
          </span>
          <button className="primary" onClick={() => setPrinting(true)}>
            Print whole year
          </button>
        </div>
      </header>

      <div className="app__main">
        {showYear ? <YearView pages={pages} margins={DEFAULT_MARGINS} layout={layout} flip={flip} /> : <Editor />}
      </div>

      {layout === 'a4' && view === 'year' && (
        <aside className="help no-print">
          <strong>How to print:</strong> print double-sided, flip on the <b>{flip} edge</b>, scale 100% / “actual
          size”, margins none. Keep the sheets in order, cut the whole stack in half along the marks, then put the
          left-half stack on top of the right-half stack.
        </aside>
      )}
    </div>
  );
}
