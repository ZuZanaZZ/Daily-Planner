import type { BlockProps } from './registry';
import { LuAnnoyed, LuDroplet, LuFrown, LuLaugh, LuMeh, LuMoon, LuSmile } from 'react-icons/lu';

/** Splits a comma separated prop into trimmed labels. */
export function labelList(value: unknown): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Water tracker: a row of droplets to colour in. */
export function Water({ props }: BlockProps<{ title: string; count: number }>) {
  const count = Math.max(1, Math.min(16, Math.round(props.count)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-icons">
        {Array.from({ length: count }, (_, i) => (
          <LuDroplet key={i} className="blk-icon" />
        ))}
      </div>
    </div>
  );
}

/** Sleep tracker: a row of moons, colour one in per hour of sleep. */
export function Sleep({ props }: BlockProps<{ title: string; hours: number }>) {
  const hours = Math.max(1, Math.min(12, Math.round(props.hours)));
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-icons">
        {Array.from({ length: hours }, (_, i) => (
          <LuMoon key={i} className="blk-icon" />
        ))}
      </div>
    </div>
  );
}

/** Mood faces from sad to happy. */
const FACES = [LuFrown, LuAnnoyed, LuMeh, LuSmile, LuLaugh];

/** Mood: five faces from sad to happy, circle one. */
export function Mood({ props }: BlockProps<{ title: string }>) {
  return (
    <div className="blk-box">
      {props.title && <div className="blk-title">{props.title}</div>}
      <div className="blk-icons blk-icons--spread">
        {FACES.map((Face, i) => (
          <Face key={i} className="blk-icon" />
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
