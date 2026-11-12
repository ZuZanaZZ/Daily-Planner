import { GRID, type PlacedBlock } from '../model/types';

type Rect = Pick<PlacedBlock, 'x' | 'y' | 'w' | 'h'>;

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** First grid position (top to bottom, left to right) where a w x h block fits without overlap. */
export function findFreeSpot(blocks: Rect[], w: number, h: number, rows: number): { x: number; y: number } {
  for (let y = 0; y + h <= rows; y++) {
    for (let x = 0; x + w <= GRID.cols; x++) {
      if (!blocks.some((b) => overlaps(b, { x, y, w, h }))) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

/** Block type currently being dragged from the palette (dragover can't read dataTransfer). */
export const paletteDrag: { type: string | null } = { type: null };
