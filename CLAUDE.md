# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Daily Planner Maker": a local, browser-only app (Vite + React 19 + TypeScript) for designing an A5 daily planner with a snap-to-grid block editor and printing the whole year via the browser's print dialog. No backend, no tests, no linter. Runtime deps are only `react`, `react-dom` and `react-icons` (Lucide set, `react-icons/lu`). The owner deliberately avoids extra dependencies (no date library, no state library, no drag-and-drop library); don't add one without asking.

## Commands

- `npm run dev`: dev server
- `npm run build`: `tsc --noEmit && vite build`. This is the only check there is (strict TS with `noUnusedLocals`/`noUnusedParameters`, so unused imports fail the build).
- `npm run preview`: serve the production build

URL params override saved settings, handy for testing: `?year=2027&layout=a5&flip=long&sides=single&weekStart=0&view=year`.

## Architecture

Core idea: **templates are data, pages are generated from them, blocks are components that draw themselves from `(ctx, props)`.**

- `src/model/types.ts`: all core types plus geometry constants. Everything is in **mm**: A5 148x210, a 12-column grid with 5 mm rows and 2 mm column gap. Block positions are in grid units. `contentRows(margins)` gives the usable row count (38 with the default margins in `defaultTemplates.ts`).
- `src/model/defaultTemplates.ts`: the 7 editable page designs (`TemplateSet` slots: cover, year, yearPlan, monthCalendar, monthPlan, daily, notes) and `SLOTS`, the editor metadata per slot (tab section, left/right side, which palette block group opens first).
- `src/generator/year.ts`: `buildYear(config, templates)` expands the 7 templates into the ordered `PlannerPage[]` for the year (the same daily template reused per date, month spreads, optional notes pages, filler notes pages so spreads start on a left-hand page when double-sided). Even index = right-hand page, odd = left-hand (`sideOf`); the inner (binding) margin flips accordingly.
- `src/generator/imposition.ts`: `cutAndStack()` for A4 printing, two A5 pages per A4 side ("cut the stack in half, put left stack on right stack"). Back sides swap halves; long-edge flip rotates the back (`sheet--rotated`).
- `src/blocks/registry.ts`: one `BlockDef` per block drives three things at once: the palette (label/icon/group), `Page` rendering (`Component`, `defaultProps` merged under saved `props`), and the properties panel form (`fields`). Adding a block = component in `src/blocks/`, entry in `defs`, optional icon in `editor/icons.tsx`; no other file needs to change. Style blocks with the theme CSS variables (`var(--page-primary)`, `--page-accent`, `--page-soft`, `--page-line`) so they follow monthly colours (`src/model/themes.ts`).
- `src/components/Page.tsx`: renders one template as a CSS grid; shared by the editor and the preview. `EditorCanvas` wraps it and overlays transparent `.ed-item` boxes in the same grid cells to receive drag/resize.
- `src/state/store.tsx`: a single `useReducer` wrapped by a history reducer, exposed through context (`useStore`). Undo/redo (limit `UNDO_LIMIT = 10`) records only `templates`, never `settings`. Consecutive actions sharing a `group` string collapse into one undo step (a drag or a typing burst). State is saved to localStorage key `daily-planner.v1` (present state only); `normalizeState` merges old saves over defaults, so new settings need defaults in `initialState()` and nested objects (like `notes`) merged by hand there.
- `src/components/YearView.tsx`: the Preview. Performance is deliberate: `Lazy` (IntersectionObserver) renders big pages only near the viewport, `Thumb` renders sidebar thumbnails only after 150 ms in view, `memo` on `Page`/`NavItem`/`MainList`, `contain: strict` on `.page`, and `beforeprint` + `flushSync` render everything before printing. Keep these in mind before changing how pages render; thumbnails avoid blurred shadows for the same reason.
- Printing: no PDF library. `App` triggers `window.print()` after rendering all pages; the `@page` rule (A4 landscape or A5 portrait) is injected by `YearView`; `src/styles/print.css` and the `.no-print` class hide UI and force page breaks and exact colours.

## Conventions and gotchas

- All page-internal sizing is in mm so screen equals print; don't use px inside pages.
- Icons come from `react-icons/lu` (Lucide). The editor palette maps registry `icon` name strings to components in `src/editor/icons.tsx`; icons inside blocks use the `.blk-icon` class from `page.css`. Hand-drawn SVG icons were intentionally removed. The only standalone SVG is `public/favicon.svg` (it can't use React components).
- Cursor choice is intentional: `grab` everywhere in the editor, including while dragging (Chrome's `grabbing` cursor is an invisible white blob on Windows).
- Saved block props override registry defaults, so changing a block's `defaultProps` won't affect blocks already placed on a saved design.
- The locale `'en-GB'` is hard-coded in `App.tsx`, `Editor.tsx` and `YearView.tsx`.
- The owner is learning and often wants to write code themselves: when asked for a tutorial or explanation, describe the steps instead of writing the code, and don't commit unless asked.
