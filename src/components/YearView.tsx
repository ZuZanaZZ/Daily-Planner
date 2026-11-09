import { useMemo } from 'react';
import { Page } from './Page';
import { cutAndStack, type Slot } from '../generator/imposition';
import { sideOf } from '../generator/year';
import type { Margins, PlannerPage } from '../model/types';

export type PrintLayout = 'a5' | 'a4';
export type DuplexFlip = 'short' | 'long';

interface Props {
  pages: PlannerPage[];
  margins: Margins;
  layout: PrintLayout;
  flip: DuplexFlip;
}

export function YearView({ pages, margins, layout, flip }: Props) {
  const sheets = useMemo(() => (layout === 'a4' ? cutAndStack(pages.length) : []), [layout, pages.length]);

  const renderSlot = (slot: Slot) =>
    slot === null ? (
      <div className="page page--blank" />
    ) : (
      <Page template={pages[slot].template} ctx={pages[slot].ctx} margins={margins} side={sideOf(slot)} />
    );

  // The page size for printing depends on the chosen layout.
  const pageRule =
    layout === 'a4' ? '@page { size: A4 landscape; margin: 0; }' : '@page { size: A5 portrait; margin: 0; }';

  if (layout === 'a5') {
    return (
      <>
        <style>{pageRule}</style>
        <div className="pages pages--year">
          {pages.map((p, i) => (
            <Page key={p.key} template={p.template} ctx={p.ctx} margins={margins} side={sideOf(i)} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pageRule}</style>
      <div className="sheets">
        {sheets.map((s, i) => (
          <div key={i} className="sheet-pair">
            <div className="sheet-label no-print">Sheet {i + 1} — front</div>
            <div className="sheet">
              {renderSlot(s.front[0])}
              {renderSlot(s.front[1])}
              <CutMarks />
            </div>
            <div className="sheet-label no-print">Sheet {i + 1} — back</div>
            {/* Flipping on the long edge turns the back upside down, so rotate it. */}
            <div className={`sheet${flip === 'long' ? ' sheet--rotated' : ''}`}>
              {renderSlot(s.back[0])}
              {renderSlot(s.back[1])}
              <CutMarks />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CutMarks() {
  return (
    <>
      <span className="cut-mark cut-mark--top" />
      <span className="cut-mark cut-mark--bottom" />
    </>
  );
}
