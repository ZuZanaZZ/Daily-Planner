import { BLOCK_LIST } from '../blocks/registry';
import type { BlockGroup } from '../model/types';
import { paletteDrag } from './layout';

const GROUP_LABEL: Record<BlockGroup, string> = {
  daily: 'Daily blocks',
  month: 'Month blocks',
  year: 'Year blocks',
  general: 'General',
};

const ALL_GROUPS: BlockGroup[] = ['daily', 'month', 'year', 'general'];

interface Props {
  /** Group of the page being edited; shown first and open. */
  group: BlockGroup;
  onAdd: (type: string) => void;
}

export function BlockPalette({ group, onAdd }: Props) {
  const order = [group, ...ALL_GROUPS.filter((g) => g !== group)];

  return (
    <div className="ed-palette">
      <p className="ed-hint">Drag a block onto the page, or click it to add.</p>
      {order.map((g) => (
        <details key={g} open={g === group || g === 'general'}>
          <summary>{GROUP_LABEL[g]}</summary>
          <div className="ed-palette__items">
            {BLOCK_LIST.filter((d) => d.group === g).map((d) => (
              <div
                key={d.type}
                className="ed-palette__item"
                draggable
                onDragStart={(e) => {
                  paletteDrag.type = d.type;
                  e.dataTransfer.setData('text/plain', d.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onDragEnd={() => (paletteDrag.type = null)}
                onClick={() => onAdd(d.type)}
                title={`Add ${d.label}`}
              >
                <span className="ed-palette__icon">{d.icon}</span>
                {d.label}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
