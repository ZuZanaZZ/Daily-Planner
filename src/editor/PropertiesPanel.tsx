import { BLOCKS, type PropField } from '../blocks/registry';
import { DEFAULT_MARGINS } from '../model/defaultTemplates';
import { contentRows, GRID, type PlacedBlock, type TemplateSlot } from '../model/types';
import { newBlockId, useStore } from '../state/store';
import { clamp, findFreeSpot } from './layout';

interface Props {
  slot: TemplateSlot;
  block: PlacedBlock | null;
  onSelect: (id: string | null) => void;
}

export function PropertiesPanel({ slot, block, onSelect }: Props) {
  const { state, dispatch } = useStore();
  const rows = contentRows(DEFAULT_MARGINS);

  if (!block) {
    return (
      <div className="ed-props">
        <h3>Page</h3>
        <p className="ed-hint">
          Click a block to edit it. Drag to move, drag the corner to resize. Keyboard: arrows move, Shift+arrows
          resize, Delete removes.
        </p>
        <p className="ed-hint">Blocks outlined in red overlap another block.</p>
        <button
          className="danger"
          onClick={() => {
            if (confirm('Reset this page to the default design?')) dispatch({ type: 'resetTemplate', slot });
          }}
        >
          Reset page to default
        </button>
      </div>
    );
  }

  const def = BLOCKS[block.type];
  const values = { ...def?.defaultProps, ...block.props };
  const setProp = (key: string, value: unknown) =>
    dispatch({ type: 'updateProps', slot, id: block.id, props: { [key]: value } });
  const setGeom = (key: 'x' | 'y' | 'w' | 'h', value: number) => {
    if (!Number.isFinite(value)) return;
    const max = { x: GRID.cols - block.w, y: rows - block.h, w: GRID.cols - block.x, h: rows - block.y }[key];
    dispatch({ type: 'updateBlock', slot, id: block.id, patch: { [key]: clamp(value, key === 'w' || key === 'h' ? 1 : 0, max) } });
  };

  const duplicate = () => {
    const others = state.templates[slot].blocks;
    const spot = findFreeSpot(others, block.w, block.h, rows);
    const copy = { ...block, ...spot, id: newBlockId(block.type), props: { ...block.props } };
    dispatch({ type: 'addBlock', slot, block: copy });
    onSelect(copy.id);
  };

  return (
    <div className="ed-props">
      <h3>
        {def?.icon} {def?.label ?? block.type}
      </h3>

      {def?.fields.map((f) => (
        <Field key={f.key} field={f} value={values[f.key]} onChange={(v) => setProp(f.key, v)} />
      ))}

      <h4>Position & size (grid cells)</h4>
      <div className="ed-geom">
        {(['x', 'y', 'w', 'h'] as const).map((k) => (
          <label key={k}>
            {{ x: 'Column', y: 'Row', w: 'Width', h: 'Height' }[k]}
            <input type="number" value={block[k]} onChange={(e) => setGeom(k, Number(e.target.value))} />
          </label>
        ))}
      </div>

      <div className="ed-actions">
        <button onClick={duplicate}>Duplicate</button>
        <button
          className="danger"
          onClick={() => {
            dispatch({ type: 'removeBlock', slot, id: block.id });
            onSelect(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Field({ field, value, onChange }: { field: PropField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.kind) {
    case 'number':
      return (
        <label className="ed-field">
          <span>
            {field.label} <b>{String(value)}</b>
          </span>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </label>
      );
    case 'boolean':
      return (
        <label className="ed-field ed-field--inline">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      );
    case 'select':
      return (
        <label className="ed-field">
          <span>{field.label}</span>
          <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    case 'text':
      return (
        <label className="ed-field">
          <span>{field.label}</span>
          <input type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
          {field.hint && <small>{field.hint}</small>}
        </label>
      );
  }
}
