import type { CSSProperties } from 'react';
import type { BlockProps } from './registry';

type Style = 'lined' | 'dotted' | 'grid' | 'blank';

function paperPattern(style: Style, s: number): CSSProperties {
  const size = `${s}mm ${s}mm`;
  switch (style) {
    case 'lined':
      return {
        backgroundImage: `linear-gradient(to bottom, transparent calc(${s}mm - 0.25mm), var(--line) calc(${s}mm - 0.25mm))`,
        backgroundSize: `100% ${s}mm`,
      };
    case 'dotted':
      return {
        backgroundImage: 'radial-gradient(circle, var(--primary) 0.3mm, transparent 0.35mm)',
        backgroundSize: size,
        backgroundPosition: `${s / 2}mm ${s / 2}mm`,
      };
    case 'grid':
      return {
        backgroundImage:
          'linear-gradient(to right, var(--line) 0.2mm, transparent 0.2mm), linear-gradient(to bottom, var(--line) 0.2mm, transparent 0.2mm)',
        backgroundSize: size,
      };
    default:
      return {};
  }
}

export function Notes({ props }: BlockProps<{ title: string; style: Style; spacing: number }>) {
  return (
    <div className="blk-box blk-notes">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-notes__paper" style={paperPattern(props.style, props.spacing)} />
    </div>
  );
}
