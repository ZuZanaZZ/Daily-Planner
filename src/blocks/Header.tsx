import type { BlockProps } from './registry';
import { formatDay, monthName } from '../generator/calendar';

export function Header({ ctx, props }: BlockProps<{ align: 'left' | 'center' | 'right' }>) {
  const cls = `blk-header blk-header--${props.align}`;

  if (ctx.kind === 'daily' && ctx.date) {
    const d = formatDay(ctx.locale, ctx.date);
    return (
      <div className={cls}>
        <span className="blk-header__big">{d.day}</span>
        <span className="blk-header__sub">
          <strong>{d.weekday}</strong>
          <br />
          {d.month} {ctx.year}
        </span>
      </div>
    );
  }

  if (ctx.kind === 'cover') {
    return (
      <div className={`${cls} blk-header--cover`}>
        <span className="blk-header__sub">planner</span>
        <span className="blk-header__big">{ctx.year}</span>
      </div>
    );
  }

  if (ctx.kind === 'year') {
    return (
      <div className={cls}>
        <span className="blk-header__title">{ctx.year}</span>
        <span className="blk-header__sub">year at a glance</span>
      </div>
    );
  }

  return (
    <div className={cls}>
      <span className="blk-header__title">{monthName(ctx.locale, ctx.month)}</span>
      <span className="blk-header__sub">{ctx.year}</span>
    </div>
  );
}
