import { memo, type ReactNode, type Ref } from 'react';
import { BLOCKS } from '../blocks/registry';
import { themeVars } from '../model/themes';
import { contentWidthMm, GRID, PAGE, type Margins, type PageContext, type PageTemplate } from '../model/types';

interface Props {
  template: PageTemplate;
  ctx: PageContext;
  margins: Margins;
  /** Right-hand pages bind on the left; left-hand pages bind on the right. */
  side: 'left' | 'right';
  /** Extra grid items drawn above the blocks (used by the editor). */
  children?: ReactNode;
  contentRef?: Ref<HTMLDivElement>;
}

/** Memoised: a page only re-renders when its own design or date changes. */
export const Page = memo(function Page({ template, ctx, margins, side, children, contentRef }: Props) {
  const padLeft = side === 'right' ? margins.inner : margins.outer;
  const padRight = side === 'right' ? margins.outer : margins.inner;
  const width = contentWidthMm(margins);

  return (
    <div
      className="page"
      style={{
        ...themeVars(ctx.theme),
        width: `${PAGE.width}mm`,
        height: `${PAGE.height}mm`,
        padding: `${margins.top}mm ${padRight}mm ${margins.bottom}mm ${padLeft}mm`,
      }}
    >
      <div
        ref={contentRef}
        className="page__content"
        style={{
          gridTemplateColumns: `repeat(${GRID.cols}, 1fr)`,
          gridAutoRows: `${GRID.rowMm}mm`,
          columnGap: `${GRID.gapMm}mm`,
        }}
      >
        {template.blocks.map((b) => {
          const def = BLOCKS[b.type];
          if (!def) return null;
          const { Component } = def;
          return (
            <div
              key={b.id}
              className="page__block"
              style={{ gridColumn: `${b.x + 1} / span ${b.w}`, gridRow: `${b.y + 1} / span ${b.h}` }}
            >
              <Component
                ctx={ctx}
                props={{ ...def.defaultProps, ...b.props }}
                widthMm={(width * b.w) / GRID.cols}
                heightMm={b.h * GRID.rowMm}
              />
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
});
