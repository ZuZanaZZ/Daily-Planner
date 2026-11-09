import type { BlockProps } from './registry';
import { monthGrid, monthName, weekdayNames } from '../generator/calendar';

export function MonthCalendar({ ctx, props }: BlockProps<{ size: 'mini' | 'large' }>) {
  const weeks = monthGrid(ctx.year, ctx.month, ctx.weekStart);
  const names = weekdayNames(ctx.locale, ctx.weekStart, props.size === 'mini' ? 'narrow' : 'short');
  const today = ctx.kind === 'daily' && ctx.date ? ctx.date.getDate() : null;

  return (
    <div className={`blk-cal blk-cal--${props.size}`}>
      {props.size === 'mini' && <div className="blk-title">{monthName(ctx.locale, ctx.month)}</div>}
      <div className="blk-cal__grid" style={{ gridTemplateRows: `auto repeat(${weeks.length}, 1fr)` }}>
        {names.map((n) => (
          <div key={n} className="blk-cal__dow">
            {n}
          </div>
        ))}
        {weeks.flat().map((d, i) => (
          <div key={i} className={`blk-cal__day${d === null ? ' is-empty' : ''}${d !== null && d === today ? ' is-today' : ''}`}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
