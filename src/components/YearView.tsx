import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { Page } from './Page';
import { formatDate, monthName } from '../generator/calendar';
import { cutAndStack, type Sheet, type Slot } from '../generator/imposition';
import { sideOf } from '../generator/year';
import { PAGE, type Margins, type PlannerPage } from '../model/types';

export type PrintLayout = 'a5' | 'a4';
export type DuplexFlip = 'short' | 'long';

interface Props {
  pages: PlannerPage[];
  margins: Margins;
  layout: PrintLayout;
  flip: DuplexFlip;
  sides: 'double' | 'single';
  /** Render every page now (used when printing). */
  renderAll?: boolean;
}

/** How many pages/sheets render straight away; the rest load as you scroll. */
const EAGER_COUNT = 2;

/** One printed side (A4 mode) or one page (A5 mode), shown big and as a thumbnail. */
interface ViewItem {
  id: string;
  label: string;
  sub: string;
  widthMm: number;
  heightMm: number;
  content: ReactNode;
}

const LOCALE = 'en-GB';
const PX_PER_MM = 96 / 25.4;

function describePage(p: PlannerPage): string {
  const { ctx } = p;
  switch (ctx.kind) {
    case 'cover':
      return 'Cover';
    case 'year':
      return 'Year';
    case 'month-spread':
    case 'month-plan':
      return monthName(LOCALE, ctx.month);
    case 'daily':
      return ctx.date
        ? formatDate(LOCALE, ctx.date, { weekday: 'short', day: 'numeric', month: 'short' })
        : 'Day';
    case 'notes':
      return 'Notes';
  }
}

export function YearView({ pages, margins, layout, flip, sides, renderAll = false }: Props) {
  const mainRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);

  // Ctrl+P / the browser's print menu: render every page before the print snapshot.
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);
  const all = renderAll || printing;

  const items = useMemo<ViewItem[]>(() => {
    const renderSlot = (slot: Slot) =>
      slot === null ? (
        <div className="page page--blank" />
      ) : (
        <Page
          template={pages[slot].template}
          ctx={pages[slot].ctx}
          margins={margins}
          side={sideOf(slot, sides)}
        />
      );

    if (layout === 'a5') {
      return pages.map((p, i) => ({
        id: `p${i}`,
        label: `Page ${i + 1}`,
        sub: describePage(p),
        widthMm: PAGE.width,
        heightMm: PAGE.height,
        content: <Page template={p.template} ctx={p.ctx} margins={margins} side={sideOf(i, sides)} />,
      }));
    }

    const slotName = (s: Slot) => (s === null ? 'blank' : describePage(pages[s]));
    const faceSlots = (s: Sheet, face: 'front' | 'back') => (face === 'front' ? s.front : s.back!);
    const sheetSide = (s: Sheet, face: 'front' | 'back') => {
      const [a, b] = faceSlots(s, face);
      // Flipping on the long edge turns the back upside down, so rotate it.
      const rotated = face === 'back' && flip === 'long';
      return (
        <div className={`sheet${rotated ? ' sheet--rotated' : ''}`}>
          {renderSlot(a)}
          {renderSlot(b)}
          <CutMarks />
        </div>
      );
    };

    const faces = sides === 'double' ? (['front', 'back'] as const) : (['front'] as const);
    return cutAndStack(pages.length, sides).flatMap((s, i) =>
      faces.map((face) => {
        const [a, b] = faceSlots(s, face);
        return {
          id: `s${i}-${face}`,
          label: sides === 'double' ? `Sheet ${i + 1} · ${face}` : `Sheet ${i + 1}`,
          sub: `${slotName(a)} · ${slotName(b)}`,
          widthMm: 297,
          heightMm: 210,
          content: sheetSide(s, face),
        };
      }),
    );
  }, [pages, margins, layout, flip, sides]);

  // Highlight the item at the top of the big view while scrolling.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const top = main.getBoundingClientRect().top + 120;
        let current = items[0]?.id ?? null;
        for (const it of items) {
          const el = document.getElementById(`yv-${it.id}`);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= top) current = it.id;
          else break;
        }
        setActive(current);
      });
    };
    onScroll();
    main.addEventListener('scroll', onScroll);
    return () => {
      main.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  // Keep the highlighted thumbnail visible in the sidebar, but only once
  // scrolling pauses, so the sidebar isn't dragged along (and redrawn) mid-scroll.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      navRef.current?.querySelector(`[data-id="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, 200);
    return () => clearTimeout(t);
  }, [active]);

  const goTo = useCallback((id: string) => {
    document.getElementById(`yv-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  }, []);

  // The page size for printing depends on the chosen layout.
  const pageRule =
    layout === 'a4' ? '@page { size: A4 landscape; margin: 0; }' : '@page { size: A5 portrait; margin: 0; }';
  const thumbPx = layout === 'a4' ? 190 : 86;

  return (
    <div className="year-layout">
      <style>{pageRule}</style>

      <aside ref={navRef} className="ed-sidebar year-nav no-print">
        <h3>{layout === 'a4' ? 'Sheets' : 'Pages'}</h3>
        <div className={`year-nav__list year-nav__list--${layout} year-nav__list--${sides}`}>
          {items.map((it) => (
            <NavItem
              key={it.id}
              item={it}
              active={it.id === active}
              onGo={goTo}
              root={navRef}
              thumbPx={thumbPx}
            />
          ))}
        </div>
      </aside>

      <div ref={mainRef} className="year-main">
        <MainList items={items} layout={layout} sides={sides} flip={flip} renderAll={all} root={mainRef} />
      </div>
    </div>
  );
}

/** One sidebar entry. Memoised: scrolling only re-renders the two entries whose highlight changes. */
const NavItem = memo(function NavItem(props: {
  item: ViewItem;
  active: boolean;
  onGo: (id: string) => void;
  root: RefObject<HTMLElement | null>;
  thumbPx: number;
}) {
  const { item, active, onGo, root, thumbPx } = props;
  return (
    <button
      data-id={item.id}
      className={`year-nav__item${active ? ' is-active' : ''}`}
      onClick={() => onGo(item.id)}
      title={`${item.label}: ${item.sub}`}
    >
      <Thumb root={root} widthMm={item.widthMm} heightMm={item.heightMm} widthPx={thumbPx}>
        {item.content}
      </Thumb>
      <span className="year-nav__label">{item.label}</span>
      <span className="year-nav__sub">{item.sub}</span>
    </button>
  );
});

/** The big preview. Memoised: it doesn't depend on the sidebar highlight. */
const MainList = memo(function MainList(props: {
  items: ViewItem[];
  layout: PrintLayout;
  sides: 'double' | 'single';
  flip: DuplexFlip;
  renderAll: boolean;
  root: RefObject<HTMLElement | null>;
}) {
  const { items, layout, sides, flip, renderAll, root } = props;

  if (layout === 'a5') {
    return (
      <div className="pages pages--year">
        {items.map((it, i) => (
          <div key={it.id} id={`yv-${it.id}`} className="page-slot">
            <Lazy root={root} eager={renderAll || i < EAGER_COUNT} widthMm={it.widthMm} heightMm={it.heightMm}>
              {it.content}
            </Lazy>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="sheets">
      {items.map((it, i) => (
        <div key={it.id} id={`yv-${it.id}`} className="sheet-side">
          <div className="sheet-label no-print">{it.label}</div>
          <div className="sheet-frame">
            <Lazy root={root} eager={renderAll || i < EAGER_COUNT} widthMm={it.widthMm} heightMm={it.heightMm}>
              {it.content}
            </Lazy>
            {sides === 'double' && <FlipEdges flip={flip} />}
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * A full-size page/sheet that only renders when it is near the visible part of
 * the preview; until then a blank placeholder of the same size holds its place.
 */
function Lazy(props: {
  root: RefObject<HTMLElement | null>;
  eager: boolean;
  widthMm: number;
  heightMm: number;
  children: ReactNode;
}) {
  const { root, eager, widthMm, heightMm, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (eager) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      root: root.current,
      rootMargin: '1500px 0px', // start a bit before it scrolls into view
    });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [root, eager]);

  return (
    <div ref={ref} className="lazy">
      {eager || visible ? (
        children
      ) : (
        <div className="lazy__placeholder" style={{ width: `${widthMm}mm`, height: `${heightMm}mm` }} />
      )}
    </div>
  );
}

/** A scaled-down preview that only renders while it is visible in the sidebar. */
function Thumb(props: {
  root: RefObject<HTMLElement | null>;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  children: ReactNode;
}) {
  const { root, widthMm, heightMm, widthPx, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scale = widthPx / (widthMm * PX_PER_MM);

  useEffect(() => {
    // Only draw a thumbnail once it has stayed in view for a moment, so thumbnails
    // the sidebar scrolls straight past are never drawn and thrown away.
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        clearTimeout(timer);
        if (e.isIntersecting) timer = window.setTimeout(() => setVisible(true), 150);
        else setVisible(false);
      },
      { root: root.current, rootMargin: '200px 0px' },
    );
    io.observe(ref.current!);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [root]);

  return (
    <div ref={ref} className="thumb" style={{ width: widthPx, height: heightMm * PX_PER_MM * scale }}>
      {visible && <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>}
    </div>
  );
}

/** On-screen only: marks the edges the sheet turns over on when printing double-sided. */
function FlipEdges({ flip }: { flip: DuplexFlip }) {
  const sides = flip === 'short' ? ['left', 'right'] : ['top', 'bottom'];
  return (
    <>
      {sides.map((side) => (
        <span key={side} className={`flip-edge flip-edge--${side} no-print`} title={`Flip on the ${flip} edge`}>
          <span className="flip-edge__label">flip edge</span>
        </span>
      ))}
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
