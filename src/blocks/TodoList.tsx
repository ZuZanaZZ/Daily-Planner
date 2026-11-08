import type { BlockProps } from './registry';

const TITLE_MM = 6;

export function TodoList({ props, heightMm }: BlockProps<{ title: string; spacing: number; checkboxes: boolean }>) {
  const rows = Math.max(0, Math.floor((heightMm - (props.title ? TITLE_MM : 0)) / props.spacing));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="blk-todo__row" style={{ height: `${props.spacing}mm` }}>
          {props.checkboxes && <span className="blk-todo__check" />}
        </div>
      ))}
    </div>
  );
}
