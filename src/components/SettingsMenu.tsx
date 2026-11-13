import { useEffect, useRef, useState } from 'react';
import { DEFAULT_TEMPLATES } from '../model/defaultTemplates';
import { normalizeState, useStore } from '../state/store';
import { PlannerFields } from './PlannerFields';

interface Props {
  pageCount: number;
}

/** "Settings" dropdown in the top bar, grouped into Planner / Printing / Design file. */
export function SettingsMenu({ pageCount }: Props) {
  const { state, dispatch } = useStore();
  const { layout, flip, sides, year } = state.settings;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const saveDesign = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'planner-design.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const loadDesign = async (file: File) => {
    try {
      const loaded = normalizeState(JSON.parse(await file.text()), {
        templates: DEFAULT_TEMPLATES,
        settings: state.settings,
      });
      // Keep the currently chosen year; designs are reusable across years.
      dispatch({ type: 'load', state: { ...loaded, settings: { ...loaded.settings, year } } });
      setOpen(false);
    } catch {
      alert('That file is not a planner design.');
    }
  };

  // Pages that fit on one sheet of paper: 2 per side on A4, 1 per side on A5; doubled when double-sided.
  const pagesPerSheet = (layout === 'a4' ? 2 : 1) * (sides === 'double' ? 2 : 1);
  const sheets = Math.ceil(pageCount / pagesPerSheet);

  return (
    <div className="menu" ref={root}>
      <button className={`menu__button${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        Settings
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="menu__panel">
          <section>
            <h4>Planner</h4>
            <PlannerFields />
          </section>

          <section>
            <h4>Printing</h4>
            <div className="fields">
              <label className="field field--wide">
                <span>Print on</span>
                <select
                  value={layout}
                  onChange={(e) => dispatch({ type: 'setSettings', settings: { layout: e.target.value as 'a4' | 'a5' } })}
                >
                  <option value="a4">A4, 2 pages per side (cut & stack)</option>
                  <option value="a5">A5 paper, 1 page per side</option>
                </select>
              </label>
              <label className="field field--wide">
                <span>Sides</span>
                <select
                  value={sides}
                  onChange={(e) =>
                    dispatch({ type: 'setSettings', settings: { sides: e.target.value as 'double' | 'single' } })
                  }
                >
                  <option value="double">Double-sided</option>
                  <option value="single">Single-sided</option>
                </select>
              </label>
              {layout === 'a4' && sides === 'double' && (
                <label className="field field--wide">
                  <span>Duplex flip</span>
                  <select
                    value={flip}
                    onChange={(e) =>
                      dispatch({ type: 'setSettings', settings: { flip: e.target.value as 'short' | 'long' } })
                    }
                  >
                    <option value="short">Short edge</option>
                    <option value="long">Long edge</option>
                  </select>
                </label>
              )}
            </div>
            <p className="menu__info">
              {pageCount} A5 pages · {sheets} {layout === 'a4' ? 'A4' : 'A5'} sheets
              {sides === 'single' ? ' (no backs, ring margin always on the left)' : ''}
            </p>
          </section>

          <section>
            <h4>Design file</h4>
            <div className="menu__row">
              <button onClick={saveDesign}>Save design</button>
              <button onClick={() => fileInput.current?.click()}>Load design</button>
            </div>
            <p className="menu__info">Save your page designs to a file and reuse them next year.</p>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadDesign(f);
                e.target.value = '';
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
}
