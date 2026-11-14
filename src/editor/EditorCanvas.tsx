import { useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { BLOCKS } from '../blocks/registry';
import { Page } from '../components/Page';
import { DEFAULT_MARGINS } from '../model/defaultTemplates';
import { contentRows, contentWidthMm, GRID, type PageContext, type PlacedBlock, type TemplateSlot } from '../model/types';
import { newBlockId, useStore } from '../state/store';
import { clamp, overlaps, paletteDrag } from './layout';

interface Props {
  slot: TemplateSlot;
  ctx: PageContext;
  side: 'left' | 'right';
  zoom: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

type Rect = { x: number; y: number; w: number; h: number };

const gridArea = (r: Rect) => ({ gridColumn: `${r.x + 1} / span ${r.w}`, gridRow: `${r.y + 1} / span ${r.h}` });

export function EditorCanvas({ slot, ctx, side, zoom, selectedId, onSelect }: Props) {
  const { state, dispatch } = useStore();
  const template = state.templates[slot];
  const rows = contentRows(DEFAULT_MARGINS);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dropHint, setDropHint] = useState<Rect | null>(null);

  /** Converts screen pixels to grid steps (works at any zoom). */
  const metrics = () => {
    const r = contentRef.current!.getBoundingClientRect();
    const pxPerMm = r.width / contentWidthMm(DEFAULT_MARGINS);
    return { r, col: (r.width + GRID.gapMm * pxPerMm) / GRID.cols, row: GRID.rowMm * pxPerMm };
  };

  const startDrag = (e: ReactPointerEvent, block: PlacedBlock, mode: 'move' | 'resize') => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // preventDefault keeps focus where it was; release it so keyboard shortcuts work.
    (document.activeElement as HTMLElement | null)?.blur();
    onSelect(block.id);

    const m = metrics();
    const sx = e.clientX;
    const sy = e.clientY;
    // Every update during this one drag is a single undo step.
    const group = `${mode}-${block.id}-${Date.now()}`;
    let last: Rect = { x: block.x, y: block.y, w: block.w, h: block.h };

    const move = (ev: PointerEvent) => {
      // Button was released somewhere we didn't hear about (outside the window).
      if (ev.buttons === 0) return up();
      const dx = Math.round((ev.clientX - sx) / m.col);
      const dy = Math.round((ev.clientY - sy) / m.row);
      const next: Rect =
        mode === 'move'
          ? {
              x: clamp(block.x + dx, 0, GRID.cols - block.w),
              y: clamp(block.y + dy, 0, rows - block.h),
              w: block.w,
              h: block.h,
            }
          : {
              x: block.x,
              y: block.y,
              w: clamp(block.w + dx, 1, GRID.cols - block.x),
              h: clamp(block.h + dy, 1, rows - block.y),
            };
      if (next.x !== last.x || next.y !== last.y || next.w !== last.w || next.h !== last.h) {
        last = next;
        dispatch({ type: 'updateBlock', slot, id: block.id, patch: next, group });
      }
    };
    // Always end the drag, however it stops, so the drag cursor never gets stuck.
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('blur', up);
      document.body.classList.remove('drag-move', 'drag-resize');
    }
    document.body.classList.add(mode === 'move' ? 'drag-move' : 'drag-resize');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('blur', up);
  };

  /** Where a palette block would land if dropped at this pointer position. */
  const dropRect = (e: DragEvent): Rect | null => {
    const def = paletteDrag.type ? BLOCKS[paletteDrag.type] : null;
    if (!def) return null;
    const m = metrics();
    const w = Math.min(def.defaultSize.w, GRID.cols);
    const h = Math.min(def.defaultSize.h, rows);
    return {
      x: clamp(Math.floor((e.clientX - m.r.left) / m.col), 0, GRID.cols - w),
      y: clamp(Math.floor((e.clientY - m.r.top) / m.row), 0, rows - h),
      w,
      h,
    };
  };

  const onDragOver = (e: DragEvent) => {
    const r = dropRect(e);
    if (!r) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!dropHint || r.x !== dropHint.x || r.y !== dropHint.y) setDropHint(r);
  };

  const onDrop = (e: DragEvent) => {
    const r = dropRect(e);
    setDropHint(null);
    if (!r || !paletteDrag.type) return;
    e.preventDefault();
    const block: PlacedBlock = { id: newBlockId(paletteDrag.type), type: paletteDrag.type, ...r, props: {} };
    dispatch({ type: 'addBlock', slot, block });
    onSelect(block.id);
    paletteDrag.type = null;
  };

  const isOverlapping = (b: PlacedBlock) => template.blocks.some((o) => o.id !== b.id && overlaps(o, b));

  return (
    <div
      className="ed-canvas"
      style={{ width: `calc(148mm * ${zoom})`, height: `calc(210mm * ${zoom})` }}
      onPointerDown={() => onSelect(null)}
      onDragOver={onDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropHint(null);
      }}
      onDrop={onDrop}
    >
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <Page template={template} ctx={ctx} margins={DEFAULT_MARGINS} side={side} contentRef={contentRef}>
          {template.blocks.map((b) => (
            <div
              key={b.id}
              className={`ed-item${b.id === selectedId ? ' is-selected' : ''}${isOverlapping(b) ? ' is-overlapping' : ''}`}
              style={gridArea(b)}
              onPointerDown={(e) => startDrag(e, b, 'move')}
            >
              <span className="ed-item__label">{BLOCKS[b.type]?.label ?? b.type}</span>
              <span className="ed-item__handle" onPointerDown={(e) => startDrag(e, b, 'resize')} />
            </div>
          ))}
          {dropHint && <div className="ed-drop" style={gridArea(dropHint)} />}
        </Page>
      </div>
    </div>
  );
}
