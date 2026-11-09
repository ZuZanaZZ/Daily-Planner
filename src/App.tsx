import { useEffect, useMemo, useState } from 'react';
import { Page } from './components/Page';
import { YearView, type DuplexFlip, type PrintLayout } from './components/YearView';
import { daysInMonth, monthName } from './generator/calendar';
import { buildYear } from './generator/year';
import { DAILY_TEMPLATE, DEFAULT_MARGINS, MONTH_TEMPLATE } from './model/defaultTemplates';
import { MONTH_THEMES } from './model/themes';
import type { PageContext } from './model/types';

const LOCALE = 'en-GB';

// Initial settings can come from the URL, e.g. ?view=year&layout=a4&year=2027
const params = new URLSearchParams(window.location.search);

export function App() {
  const [year, setYear] = useState(Number(params.get('year')) || new Date().getFullYear() + 1);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(1);
  const [weekStart, setWeekStart] = useState<0 | 1>(params.get('weekStart') === '0' ? 0 : 1);
  const [view, setView] = useState<'sample' | 'year'>(params.get('view') === 'year' ? 'year' : 'sample');
  const [layout, setLayout] = useState<PrintLayout>(params.get('layout') === 'a5' ? 'a5' : 'a4');
  const [flip, setFlip] = useState<DuplexFlip>(params.get('flip') === 'long' ? 'long' : 'short');
  const [printing, setPrinting] = useState(false);

  const pages = useMemo(
    () => buildYear({ year, weekStart, locale: LOCALE, margins: DEFAULT_MARGINS }),
    [year, weekStart],
  );

  // Render the full year first, then open the print dialog.
  useEffect(() => {
    if (!printing) return;
    window.print();
    setPrinting(false);
  }, [printing]);

  const safeDay = Math.min(day, daysInMonth(year, month));
  const base = { year, month, weekStart, locale: LOCALE, theme: MONTH_THEMES[month] };
  const monthCtx: PageContext = { ...base, kind: 'month-spread' };
  const dailyCtx: PageContext = { ...base, kind: 'daily', date: new Date(year, month, safeDay) };

  const sheetCount = Math.ceil(pages.length / 4);
  const showYear = view === 'year' || printing;

  return (
    <div className="app">
      <header className="toolbar no-print">
        <h1>Daily Planner</h1>
        <div className="toggle">
          <button className={view === 'sample' ? 'is-active' : ''} onClick={() => setView('sample')}>
            Sample pages
          </button>
          <button className={view === 'year' ? 'is-active' : ''} onClick={() => setView('year')}>
            Whole year
          </button>
        </div>
        <label>
          Year
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} />
        </label>
        {view === 'sample' && (
          <>
            <label>
              Month
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, m) => (
                  <option key={m} value={m}>
                    {monthName(LOCALE, m)} — {MONTH_THEMES[m].name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Day
              <input
                type="number"
                min={1}
                max={daysInMonth(year, month)}
                value={safeDay}
                onChange={(e) => setDay(Number(e.target.value) || 1)}
              />
            </label>
          </>
        )}
        <label>
          Week starts
          <select value={weekStart} onChange={(e) => setWeekStart(Number(e.target.value) as 0 | 1)}>
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
        <label>
          Print on
          <select value={layout} onChange={(e) => setLayout(e.target.value as PrintLayout)}>
            <option value="a4">A4, 2 pages per side (cut & stack)</option>
            <option value="a5">A5 paper, 1 page per side</option>
          </select>
        </label>
        {layout === 'a4' && (
          <label>
            Duplex flip
            <select value={flip} onChange={(e) => setFlip(e.target.value as DuplexFlip)}>
              <option value="short">Short edge</option>
              <option value="long">Long edge</option>
            </select>
          </label>
        )}
        <div className="toolbar__end">
          <span className="toolbar__info">
            {pages.length} pages{layout === 'a4' ? ` · ${sheetCount} A4 sheets` : ''}
          </span>
          <button className="primary" onClick={() => setPrinting(true)}>
            Print whole year
          </button>
        </div>
      </header>

      {showYear ? (
        <YearView pages={pages} margins={DEFAULT_MARGINS} layout={layout} flip={flip} />
      ) : (
        <main className="pages">
          <Page template={MONTH_TEMPLATE} ctx={monthCtx} margins={DEFAULT_MARGINS} side="left" />
          <Page template={DAILY_TEMPLATE} ctx={dailyCtx} margins={DEFAULT_MARGINS} side="right" />
        </main>
      )}

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
