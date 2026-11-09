import type { BlockProps } from './registry';
import { MonthCalendar } from './MonthCalendar';

/** 12 mini calendars in a 3 x 4 grid. */
export function YearGrid({ ctx, widthMm, heightMm }: BlockProps) {
  return (
    <div className="blk-year">
      {Array.from({ length: 12 }, (_, m) => (
        <MonthCalendar
          key={m}
          ctx={{ ...ctx, month: m }}
          props={{ size: 'mini' }}
          widthMm={widthMm / 3}
          heightMm={heightMm / 4}
        />
      ))}
    </div>
  );
}
