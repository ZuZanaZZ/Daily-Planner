// Tiny calendar helpers built on native Date + Intl (no date library needed).

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Column (0-6) of the 1st of the month, given the week start (0 = Sun, 1 = Mon). */
export function firstWeekdayOffset(year: number, month: number, weekStart: 0 | 1): number {
  const dow = new Date(year, month, 1).getDay(); // 0 = Sunday
  return (dow - weekStart + 7) % 7;
}

/**
 * Weeks of a month as rows of 7 cells; `null` marks days outside the month.
 */
export function monthGrid(year: number, month: number, weekStart: 0 | 1): (number | null)[][] {
  const cells: (number | null)[] = Array(firstWeekdayOffset(year, month, weekStart)).fill(null);
  for (let d = 1; d <= daysInMonth(year, month); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Localized weekday names ordered from the week start. */
export function weekdayNames(locale: string, weekStart: 0 | 1, style: 'short' | 'narrow' | 'long' = 'short'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: style });
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + ((i + weekStart) % 7))));
}

export function monthName(locale: string, month: number, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2023, month, 1));
}

export function formatDay(locale: string, date: Date): { weekday: string; day: number; month: string } {
  return {
    weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
    day: date.getDate(),
    month: monthName(locale, date.getMonth()),
  };
}
