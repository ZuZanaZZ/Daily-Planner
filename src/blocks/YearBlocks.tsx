import type { BlockProps } from './registry';
import { daysInMonth, monthName } from '../generator/calendar';
import { paperPattern } from './Notes';

/** Year in pixels: 12 month columns x 31 day rows to colour in. */
export function YearPixels({ ctx, props }: BlockProps<{ title: string }>) {
  const months = Array.from({ length: 12 }, (_, m) => m);
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-pixels">
        <span />
        {months.map((m) => (
          <span key={m} className="blk-pixels__month">
            {monthName(ctx.locale, m, 'short').charAt(0).toUpperCase()}
          </span>
        ))}
        {Array.from({ length: 31 }, (_, d) => [
          <span key={`d${d}`} className="blk-pixels__day">
            {d + 1}
          </span>,
          ...months.map((m) => (
            <span
              key={`${m}-${d}`}
              className={`blk-pixels__cell${d + 1 > daysInMonth(ctx.year, m) ? ' is-empty' : ''}`}
            />
          )),
        ])}
      </div>
    </div>
  );
}

type PaperStyle = 'lined' | 'dotted' | 'grid' | 'blank';

/** Twelve labelled boxes, e.g. for birthdays or goals per month. */
export function MonthBoxes({ ctx, props }: BlockProps<{ title: string; columns: number; style: PaperStyle }>) {
  const cols = Math.max(1, Math.min(4, Math.round(props.columns)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-mboxes" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: 12 }, (_, m) => (
          <div key={m} className="blk-mboxes__box">
            <span className="blk-mboxes__name">{monthName(ctx.locale, m)}</span>
            <div className="blk-notes__paper" style={paperPattern(props.style, 4.5)} />
          </div>
        ))}
      </div>
    </div>
  );
}
