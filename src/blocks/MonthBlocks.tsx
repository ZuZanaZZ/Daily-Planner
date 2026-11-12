import type { BlockProps } from './registry';
import { daysInMonth, monthGrid } from '../generator/calendar';
import { labelList } from './Trackers';

function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

/** Habit tracker: one row per habit, one column per day of the month. */
export function HabitTracker({ ctx, props }: BlockProps<{ title: string; habits: string; rows: number }>) {
  const days = daysInMonth(ctx.year, ctx.month);
  const named = labelList(props.habits);
  const rows = Math.max(named.length, Math.round(props.rows));
  const cols = `14mm repeat(${days}, 1fr)`;

  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-habits" style={{ gridTemplateColumns: cols, gridTemplateRows: `auto repeat(${rows}, 1fr)` }}>
        <span />
        {Array.from({ length: days }, (_, d) => (
          <span key={d} className="blk-habits__num">
            {d + 1}
          </span>
        ))}
        {Array.from({ length: rows }, (_, r) => [
          <span key={`l${r}`} className="blk-habits__label">
            {named[r] ?? ''}
          </span>,
          ...Array.from({ length: days }, (_, d) => (
            <span
              key={`${r}-${d}`}
              className={`blk-habits__cell${isWeekend(ctx.year, ctx.month, d + 1) ? ' is-weekend' : ''}`}
            />
          )),
        ])}
      </div>
    </div>
  );
}

/** Weekly focus: one lined row per week of the month, labelled with its dates. */
export function WeekList({ ctx, props }: BlockProps<{ title: string }>) {
  const weeks = monthGrid(ctx.year, ctx.month, ctx.weekStart).map((w) => w.filter((d): d is number => d !== null));

  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-rows">
        {weeks.map((w, i) => (
          <div key={i} className="blk-line-row blk-line-row--top">
            <span className="blk-label">
              {w[0] === w[w.length - 1] ? w[0] : `${w[0]}–${w[w.length - 1]}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
