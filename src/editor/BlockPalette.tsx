import { BLOCK_LIST, type BlockDef } from '../blocks/registry';
import type { BlockGroup } from '../model/types';
import { BlockIcon } from './icons';
import { paletteDrag } from './layout';
import { useState } from 'react';

const GROUP_LABEL: Record<BlockGroup, string> = {
  daily: 'Daily',
  month: 'Month',
  year: 'Year',
  general: 'General',
};

const ALL_GROUPS: BlockGroup[] = ['daily', 'month', 'year', 'general'];

interface Props {
  /** Group of the page being edited; opens. */
  group: BlockGroup;
  onAdd: (type: string) => void;
}

export function BlockPalette({ group, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase();

  function renderItem(d: BlockDef) {
    return (
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
        <span className="ed-palette__icon">
          <BlockIcon name={d.icon} />
        </span>
        {d.label}
      </div>
    )
  }
  
  const results = BLOCK_LIST.filter((d) => d.label.toLowerCase().includes(search));
   
  return (
    <div className="ed-palette">
      <p className="ed-hint">Drag or click a block to add.</p>
      <div>
        <input type="text" placeholder="Search for blocks" value={query} onChange={(e) => setQuery(e.target.value)}/>
      </div>
      {search ? (
        results.length === 0 ? (
          <p className="ed-hint">No blocks found.</p>
        ) : (
          <div className="ed-palette__items">{results.map((d) => renderItem(d))}</div>
        )
      ) : (
        ALL_GROUPS.map((g) => (
          <details key={g} open={g === group || g === 'general'}>
            <summary>{GROUP_LABEL[g]}</summary>
            <div className="ed-palette__items">
              {BLOCK_LIST.filter((d) => d.group === g).map((d) => renderItem(d))}
            </div>
          </details>
        ))
      )}
    </div>
  );
}
