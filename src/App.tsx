import { useEffect, useMemo, useState } from 'react';
import { SettingsMenu } from './components/SettingsMenu';
import { YearView } from './components/YearView';
import { Editor } from './editor/Editor';
import { buildYear } from './generator/year';
import { DEFAULT_MARGINS } from './model/defaultTemplates';
import { useStore } from './state/store';

const LOCALE = 'en-GB';
const params = new URLSearchParams(window.location.search);

export function App() {
  const { state } = useStore();
  const { year, weekStart, layout, flip, notes } = state.settings;
  const [view, setView] = useState<'editor' | 'year'>(params.get('view') === 'year' ? 'year' : 'editor');
  const [printing, setPrinting] = useState(false);

  const pages = useMemo(
    () =>
      buildYear(
        { year, weekStart, locale: LOCALE, margins: DEFAULT_MARGINS, notes },
        state.templates,
      ),
    [year, weekStart, notes, state.templates],
  );

  // Render the full year first, then open the print dialog.
  useEffect(() => {
    if (!printing) return;
    window.print();
    setPrinting(false);
  }, [printing]);

  const showYear = view === 'year' || printing;

  return (
    <div className="app">
      <header className="toolbar no-print">
        <h1>Daily Planner Maker</h1>
        <div className="toggle">
          <button className={view === 'editor' ? 'is-active' : ''} onClick={() => setView('editor')}>
            Editor
          </button>
          <button className={view === 'year' ? 'is-active' : ''} onClick={() => setView('year')}>
            Whole year
          </button>
        </div>
        <div className="toolbar__end">
          <span className="toolbar__info">{year}</span>
          <SettingsMenu pageCount={pages.length} />
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
