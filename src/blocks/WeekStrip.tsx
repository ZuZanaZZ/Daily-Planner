import type { BlockProps } from './registry';
import { weekdayNames } from '../generator/calendar';

/** The seven days of the current week, with today circled. */
export function WeekStrip({ ctx }: BlockProps) {
  const names = weekdayNames(ctx.locale, ctx.weekStart, 'narrow');
  const date = ctx.date;
  const offset = date ? (date.getDay() - ctx.weekStart + 7) % 7 : -1;

  return (
    <div className="blk-week">
      {names.map((n, i) => {
        const d = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset + i) : null;
        return (
          <div key={i} className={`blk-week__day${i === offset ? ' is-today' : ''}`}>
            <span className="blk-week__name">{n}</span>
            <span className="blk-week__num">{d ? d.getDate() : ''}</span>
          </div>
        );
      })}
    </div>
  );
}
