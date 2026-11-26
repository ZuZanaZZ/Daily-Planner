// Tests for the year generator, the print layout and the saved-settings loader.
// Run with `npm test` (no extra libraries: esbuild ships with Vite, node:test ships with Node).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildYear } from '../src/generator/year';
import { cutAndStack } from '../src/generator/imposition';
import { DEFAULT_MARGINS, DEFAULT_TEMPLATES } from '../src/model/defaultTemplates';
import { MONTH_THEMES } from '../src/model/themes';
import { DEFAULT_NOTES, type PlannerConfig, type TemplateSet } from '../src/model/types';
import { normalizeState, type State } from '../src/state/store';

/** A planner config for 2027 (Jan 1 is a Friday) with weekly pages off; override what a test needs. */
const config = (over: Partial<PlannerConfig> = {}): PlannerConfig => ({
  year: 2027,
  weekStart: 1,
  locale: 'en-GB',
  margins: DEFAULT_MARGINS,
  notes: DEFAULT_NOTES,
  sides: 'double',
  weekly: false,
  ...over,
});

const weeklyOf = (pages: ReturnType<typeof buildYear>) => pages.filter((p) => p.ctx.kind === 'weekly');

// --- weekly pages in the generator ---

test('no weekly pages when the setting is off', () => {
  const pages = buildYear(config(), DEFAULT_TEMPLATES);
  assert.equal(weeklyOf(pages).length, 0);
});

test('turning weekly on adds pages and does not change the daily pages', () => {
  const off = buildYear(config(), DEFAULT_TEMPLATES);
  const on = buildYear(config({ weekly: true }), DEFAULT_TEMPLATES);
  const daily = (pages: typeof off) => pages.filter((p) => p.ctx.kind === 'daily').length;
  assert.equal(daily(off), 365);
  assert.equal(daily(on), 365);
  assert.ok(on.length > off.length);
});

test('weekly pages are numbered 1, 2, 3, ... in order', () => {
  const weeks = weeklyOf(buildYear(config({ weekly: true }), DEFAULT_TEMPLATES));
  // 2027 has 52 Sundays (week ends) plus the short last week, 27-31 December.
  assert.equal(weeks.length, 53);
  assert.deepEqual(
    weeks.map((p) => p.ctx.week),
    Array.from({ length: 53 }, (_, i) => i + 1),
  );
});

test('the first week is the short Fri-Sun week and comes right after Sunday 3 January', () => {
  const pages = buildYear(config({ weekly: true }), DEFAULT_TEMPLATES);
  const i = pages.findIndex((p) => p.ctx.kind === 'weekly');
  const date = pages[i].ctx.date!;
  assert.equal(date.getMonth(), 0);
  assert.equal(date.getDate(), 3);
  assert.equal(pages[i - 1].ctx.kind, 'daily');
  assert.equal(pages[i - 1].ctx.date!.getDate(), 3);
  // Only 3 daily pages (1, 2, 3 January) come before the first weekly page.
  assert.equal(pages.slice(0, i).filter((p) => p.ctx.kind === 'daily').length, 3);
});

test('with a Monday week start every week ends on a Sunday (except the last, 31 December)', () => {
  const weeks = weeklyOf(buildYear(config({ weekly: true }), DEFAULT_TEMPLATES));
  for (const w of weeks.slice(0, -1)) assert.equal(w.ctx.date!.getDay(), 0);
  const last = weeks[weeks.length - 1].ctx.date!;
  assert.deepEqual([last.getMonth(), last.getDate()], [11, 31]);
});

test('with a Sunday week start every week ends on a Saturday', () => {
  const weeks = weeklyOf(buildYear(config({ weekStart: 0, weekly: true }), DEFAULT_TEMPLATES));
  const first = weeks[0].ctx.date!;
  assert.deepEqual([first.getMonth(), first.getDate()], [0, 2]);
  for (const w of weeks.slice(0, -1)) assert.equal(w.ctx.date!.getDay(), 6);
});

test('each weekly page comes right after the last day of its week', () => {
  const pages = buildYear(config({ weekly: true }), DEFAULT_TEMPLATES);
  pages.forEach((p, i) => {
    if (p.ctx.kind !== 'weekly') return;
    const before = pages[i - 1];
    assert.equal(before.ctx.kind, 'daily');
    assert.equal(before.ctx.date!.getTime(), p.ctx.date!.getTime());
  });
});

test('"notes after every week" come after the weekly page, not before it', () => {
  const notes = { ...DEFAULT_NOTES, week: { enabled: true, count: 1 } };
  const pages = buildYear(config({ weekly: true, notes }), DEFAULT_TEMPLATES);
  pages.forEach((p, i) => {
    if (p.ctx.kind === 'weekly') assert.equal(pages[i + 1].ctx.kind, 'notes');
  });
});

test('weekly pages use the colours of the month they end in', () => {
  const pages = buildYear(config({ weekly: true }), DEFAULT_TEMPLATES);
  for (const p of weeklyOf(pages)) assert.equal(p.ctx.theme, MONTH_THEMES[p.ctx.month]);
});

// --- page order and printing ---

for (const weekly of [false, true]) {
  test(`double-sided: month spreads start on a left-hand page (weekly ${weekly ? 'on' : 'off'})`, () => {
    const pages = buildYear(config({ weekly }), DEFAULT_TEMPLATES);
    const left = pages.map((p, i) => ({ id: p.template.id, i })).filter((p) => p.id === 'monthCalendar');
    assert.equal(left.length, 12);
    for (const { i } of left) assert.equal(i % 2, 1);
  });
}

test('the cover is the first page', () => {
  const pages = buildYear(config({ weekly: true }), DEFAULT_TEMPLATES);
  assert.equal(pages[0].ctx.kind, 'cover');
});

for (const sides of ['double', 'single'] as const) {
  test(`cut & stack prints every page exactly once (${sides}-sided, weekly on)`, () => {
    const count = buildYear(config({ weekly: true, sides }), DEFAULT_TEMPLATES).length;
    const used: number[] = [];
    for (const sheet of cutAndStack(count, sides)) {
      for (const slot of [...sheet.front, ...(sheet.back ?? [])]) if (slot !== null) used.push(slot);
    }
    assert.deepEqual(
      used.sort((a, b) => a - b),
      Array.from({ length: count }, (_, i) => i),
    );
  });
}

// --- loading saved data ---

const fallback: State = {
  templates: DEFAULT_TEMPLATES,
  settings: {
    year: 2027,
    weekStart: 1,
    weekly: false,
    layout: 'a4',
    flip: 'short',
    sides: 'double',
    notes: DEFAULT_NOTES,
  },
};

test('an old save without the weekly setting loads with weekly off', () => {
  const loaded = normalizeState({ settings: { year: 2030 } }, fallback);
  assert.equal(loaded.settings.year, 2030);
  assert.equal(loaded.settings.weekly, false);
});

test('a saved weekly setting is kept', () => {
  const loaded = normalizeState({ settings: { weekly: true } }, fallback);
  assert.equal(loaded.settings.weekly, true);
});

test('an old save without a weekly design gets the default weekly page', () => {
  const { weekly: _weekly, ...withoutWeekly } = DEFAULT_TEMPLATES;
  const loaded = normalizeState({ templates: withoutWeekly as TemplateSet }, fallback);
  assert.deepEqual(loaded.templates.weekly.blocks, DEFAULT_TEMPLATES.weekly.blocks);
});
