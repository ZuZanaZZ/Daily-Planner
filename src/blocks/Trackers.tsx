import type { BlockProps } from './registry';

/** Splits a comma separated prop into trimmed labels. */
export function labelList(value: unknown): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function Drop() {
  return (
    <svg className="blk-icon" viewBox="0 0 10 14">
      <path d="M5 0.8 C3.5 3.4 0.8 6.4 0.8 9 A4.2 4.2 0 0 0 9.2 9 C9.2 6.4 6.5 3.4 5 0.8 Z" />
    </svg>
  );
}

/** Water tracker: a row of droplets to colour in. */
export function Water({ props }: BlockProps<{ title: string; count: number }>) {
  const count = Math.max(1, Math.min(16, Math.round(props.count)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-icons">
        {Array.from({ length: count }, (_, i) => (
          <Drop key={i} />
        ))}
      </div>
    </div>
  );
}

function Face({ mood }: { mood: number }) {
  // mood -2 (sad) .. 2 (happy) controls the mouth curve.
  const curve = 13 + mood * 1.6;
  return (
    <svg className="blk-icon" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8.6" />
      <circle cx="7" cy="8" r="0.9" className="fill" />
      <circle cx="13" cy="8" r="0.9" className="fill" />
      <path d={`M6.5 13 Q10 ${curve} 13.5 13`} />
    </svg>
  );
}

/** Mood: five faces from sad to happy, circle one. */
export function Mood({ props }: BlockProps<{ title: string }>) {
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-icons blk-icons--spread">
        {[-2, -1, 0, 1, 2].map((m) => (
          <Face key={m} mood={m} />
        ))}
      </div>
    </div>
  );
}

/** Labelled lines, e.g. meals or gratitude prompts. */
export function LabeledLines({ props }: BlockProps<{ title: string; labels: string }>) {
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-rows">
        {labelList(props.labels).map((l, i) => (
          <div key={i} className="blk-line-row">
            <span className="blk-label">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Daily habit checklist: a checkbox per habit. */
export function HabitChecklist({ props }: BlockProps<{ title: string; habits: string; columns: number }>) {
  const cols = Math.max(1, Math.min(3, Math.round(props.columns)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-checks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {labelList(props.habits).map((h, i) => (
          <div key={i} className="blk-checks__item">
            <span className="blk-todo__check" />
            {h}
          </div>
        ))}
      </div>
    </div>
  );
}
