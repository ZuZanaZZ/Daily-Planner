/**
 * "Cut & stack" imposition: two A5 pages per A4 side, printed double-sided.
 *
 * After printing, keep the sheets in order, cut the whole stack in half,
 * then put the left-half stack on top of the right-half stack. The result
 * is every A5 page in reading order, ready for punching / rings.
 *
 * With S sheets, the left halves carry leaves 0..S-1 and the right halves
 * carry leaves S..2S-1. Leaf k holds page 2k (front) and 2k+1 (back).
 */

/** A page index, or null for a blank padding slot. */
export type Slot = number | null;

export interface Sheet {
  front: [Slot, Slot]; // [left half, right half] as seen from the front
  back: [Slot, Slot]; // [left half, right half] as seen from the back
}

export function cutAndStack(pageCount: number): Sheet[] {
  const sheets = Math.ceil(pageCount / 4);
  const slot = (i: number): Slot => (i < pageCount ? i : null);
  const result: Sheet[] = [];

  for (let i = 0; i < sheets; i++) {
    const leftLeaf = i;
    const rightLeaf = sheets + i;
    result.push({
      front: [slot(2 * leftLeaf), slot(2 * rightLeaf)],
      // Turning the sheet over left-to-right swaps the halves.
      back: [slot(2 * rightLeaf + 1), slot(2 * leftLeaf + 1)],
    });
  }

  return result;
}
