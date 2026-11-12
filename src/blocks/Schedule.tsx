import type { BlockProps } from './registry';

interface P {
  title: string;
  start: number;
  end: number;
  half: boolean;
  clock: '24h' | '12h';
}

function hourLabel(h: number, clock: P['clock']): string {
  if (clock === '24h') return String(h % 24).padStart(2, '0');
  const suffix = h % 24 < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12}${suffix}`;
}

/** Hourly planner: one row per hour, optional dashed half-hour line. */
export function Schedule({ props }: BlockProps<P>) {
  const start = Math.max(0, Math.min(23, Math.round(props.start)));
  const end = Math.max(start, Math.min(24, Math.round(props.end)));
  const hours = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-rows">
        {hours.map((h) => (
          <div key={h} className="blk-sched__row">
            <span className="blk-sched__hour">{hourLabel(h, props.clock)}</span>
            {props.half && <span className="blk-sched__half" />}
          </div>
        ))}
      </div>
    </div>
  );
}
