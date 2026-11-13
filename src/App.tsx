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
  const { year, weekStart, layout, flip, notes, sides } = state.settings;
  const [view, setView] = useState<'editor' | 'year'>(params.get('view') === 'year' ? 'year' : 'editor');
  const [printing, setPrinting] = useState(false);

  const pages = useMemo(
    () =>
      buildYear(
        { year, weekStart, locale: LOCALE, margins: DEFAULT_MARGINS, notes, sides },
        state.templates,
      ),
    [year, weekStart, notes, sides, state.templates],
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
            Edit
          </button>
          <button className={view === 'year' ? 'is-active' : ''} onClick={() => setView('year')}>
            Preview
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
        {showYear ? (
          <YearView
            pages={pages}
            margins={DEFAULT_MARGINS}
            layout={layout}
            flip={flip}
            sides={sides}
            renderAll={printing}
          />
        ) : (
          <Editor />
        )}
      </div>

      {view === 'year' && (
        <aside className="help no-print">
          <button className="help__icon" aria-label="How to print" aria-describedby="print-help">
            i
          </button>
          <div id="print-help" className="help__panel" role="tooltip">
            <strong>How to print:</strong> <PrintSteps layout={layout} sides={sides} flip={flip} />
          </div>
        </aside>
      )}
    </div>
  );
}

/** Print instructions for the chosen paper and sides. */
function PrintSteps(props: { layout: 'a4' | 'a5'; sides: 'double' | 'single'; flip: 'short' | 'long' }) {
  const { layout, sides, flip } = props;
  const common = 'scale 100% / “actual size”, margins none.';
  const cut =
    ' Keep the sheets in order, cut the whole stack in half along the marks, then put the left-half stack on top of the right-half stack.';

  if (layout === 'a4' && sides === 'double') {
    return (
      <>
        print on A4 double-sided, flip on the <b>{flip} edge</b>, {common}
        {cut}
      </>
    );
  }
  if (layout === 'a4') {
    return (
      <>
        print on A4 <b>single-sided</b>, {common}
        {cut}
      </>
    );
  }
  if (sides === 'double') {
    return (
      <>
        print on A5 paper double-sided, flip on the <b>long edge</b>, {common}
      </>
    );
  }
  return (
    <>
      print on A5 paper <b>single-sided</b>, {common}
    </>
  );
}
