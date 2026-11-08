import { useState } from 'react';
import { Page } from './components/Page';
import { daysInMonth, monthName } from './generator/calendar';
import { DAILY_TEMPLATE, DEFAULT_MARGINS, MONTH_TEMPLATE } from './model/defaultTemplates';
import { MONTH_THEMES } from './model/themes';
import type { PageContext } from './model/types';

const LOCALE = 'en-GB';

export function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear() + 1);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(1);
  const [weekStart, setWeekStart] = useState<0 | 1>(1);

  const safeDay = Math.min(day, daysInMonth(year, month));
  const base = { year, month, weekStart, locale: LOCALE, theme: MONTH_THEMES[month] };
  const monthCtx: PageContext = { ...base, kind: 'month-spread' };
  const dailyCtx: PageContext = { ...base, kind: 'daily', date: new Date(year, month, safeDay) };

  return (
    <div className="app">
      <header className="toolbar no-print">
        <h1>Daily Planner</h1>
        <label>
          Year
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} />
        </label>
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
        <label>
          Week starts
          <select value={weekStart} onChange={(e) => setWeekStart(Number(e.target.value) as 0 | 1)}>
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
        <button onClick={() => window.print()}>Print / Save PDF</button>
      </header>

      <main className="pages">
        <Page template={MONTH_TEMPLATE} ctx={monthCtx} margins={DEFAULT_MARGINS} side="left" />
        <Page template={DAILY_TEMPLATE} ctx={dailyCtx} margins={DEFAULT_MARGINS} side="right" />
      </main>
    </div>
  );
}
