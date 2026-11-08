import { BLOCKS } from '../blocks/registry';
import { themeVars } from '../model/themes';
import { GRID, PAGE, type Margins, type PageContext, type PageTemplate } from '../model/types';

interface Props {
  template: PageTemplate;
  ctx: PageContext;
  margins: Margins;
  /** Right-hand pages bind on the left; left-hand pages bind on the right. */
  side: 'left' | 'right';
}

export function Page({ template, ctx, margins, side }: Props) {
  const padLeft = side === 'right' ? margins.inner : margins.outer;
  const padRight = side === 'right' ? margins.outer : margins.inner;
  const contentWidth = PAGE.width - padLeft - padRight;

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
        className="page__content"
        style={{
          gridTemplateColumns: `repeat(${GRID.cols}, 1fr)`,
          gridAutoRows: `${GRID.rowMm}mm`,
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
                widthMm={(contentWidth * b.w) / GRID.cols}
                heightMm={b.h * GRID.rowMm}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
