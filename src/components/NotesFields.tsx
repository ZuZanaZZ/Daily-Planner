import type { NotesPlacement } from '../model/types';
import { useStore } from '../state/store';

const OPTIONS: { key: NotesPlacement; label: string }[] = [
  { key: 'day', label: 'After every day' },
  { key: 'week', label: 'After every week' },
  { key: 'month', label: 'After every month' },
  { key: 'end', label: 'At the end of the planner' },
];

const MAX = 50;

/** Tick boxes for where extra notes pages go, each with a page count. */
export function NotesFields() {
  const { state, dispatch } = useStore();
  const notes = state.settings.notes;

  const update = (key: NotesPlacement, patch: Partial<{ enabled: boolean; count: number }>) =>
    dispatch({ type: 'setSettings', settings: { notes: { ...notes, [key]: { ...notes[key], ...patch } } } });

  return (
    <div className="notes-fields">
      {OPTIONS.map(({ key, label }) => (
        <div key={key} className={`notes-fields__row${notes[key].enabled ? '' : ' is-off'}`}>
          <label className="notes-fields__check">
            <input
              type="checkbox"
              checked={notes[key].enabled}
              onChange={(e) => update(key, { enabled: e.target.checked })}
            />
            {label}
          </label>
          <input
            type="number"
            className="notes-fields__count"
            min={1}
            max={MAX}
            value={notes[key].count}
            disabled={!notes[key].enabled}
            aria-label={`Notes pages ${label.toLowerCase()}`}
            onChange={(e) =>
              update(key, { count: Math.max(1, Math.min(MAX, Math.floor(Number(e.target.value) || 1))) })
            }
          />
        </div>
      ))}
    </div>
  );
}
