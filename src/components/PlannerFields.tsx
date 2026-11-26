import { useStore } from '../state/store';

/** Year + week start inputs, shared by the settings menu and the editor sidebar. */
export function PlannerFields() {
  const { state, dispatch } = useStore();
  const { year, weekStart } = state.settings;
  const thisYear = new Date().getFullYear();
  const start = Math.min(year, thisYear);
  const end = Math.max(year, thisYear + 3);

  return (
    <div className="fields">
      <label className="field">
        <span>Year</span>
        <select
          value={year}
          onChange={(e) => dispatch({ type: 'setSettings', settings: { year: Number(e.target.value) } })}
        >
          {Array.from({ length: end - start + 1 }, (_, i) => (
            <option key={start + i} value={start + i}>
              {i + start}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Week starts</span>
        <select
          value={weekStart}
          onChange={(e) => dispatch({ type: 'setSettings', settings: { weekStart: Number(e.target.value) as 0 | 1 } })}
        >
          <option value={1}>Monday</option>
          <option value={0}>Sunday</option>
        </select>
      </label>
    </div>
  );
}
