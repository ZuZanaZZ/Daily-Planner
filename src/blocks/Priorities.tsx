import type { BlockProps } from './registry';

/** Numbered "top priorities" lines. */
export function Priorities({ props }: BlockProps<{ title: string; count: number }>) {
  const count = Math.max(1, Math.min(10, Math.round(props.count)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-rows">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="blk-line-row">
            <span className="blk-prio__num">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
