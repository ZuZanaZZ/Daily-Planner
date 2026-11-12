import type { BlockProps } from './registry';

interface P {
  text: string;
  size: number;
  align: 'left' | 'center' | 'right';
  style: 'plain' | 'banner' | 'outline';
}

/** Free text: titles, quotes, prompts. */
export function TextBlock({ props }: BlockProps<P>) {
  return (
    <div
      className={`blk-text blk-text--${props.style}`}
      style={{ fontSize: `${props.size}mm`, textAlign: props.align, justifyContent: props.align }}
    >
      <span>{props.text}</span>
    </div>
  );
}
