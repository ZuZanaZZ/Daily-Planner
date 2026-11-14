import type { ReactNode } from 'react';

/** Simple outline icons (24 x 24, stroke only) for the block palette. */
const ICONS: Record<string, ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  star: <path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8z" />,
  week: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2.5" />
      <circle cx="7.5" cy="12" r="0.6" />
      <circle cx="10.5" cy="12" r="0.6" />
      <circle cx="13.5" cy="12" r="1.8" />
      <circle cx="16.5" cy="12" r="0.6" />
    </>
  ),
  droplet: <path d="M12 3.5C9 7.6 6 11 6 14.2a6 6 0 0 0 12 0C18 11 15 7.6 12 3.5z" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9.8v.4M15 9.8v.4M8.5 14.2c.9 1.4 2.1 2.1 3.5 2.1s2.6-.7 3.5-2.1" />
    </>
  ),
  utensils: <path d="M5 3.5v5a2 2 0 0 0 4 0v-5M7 3.5v17M17.5 20.5v-17c-2 1.8-3 4.6-3 8.5h3" />,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4 4 0 0 1 12 7.3a4 4 0 0 1 7.5 2.2c0 5.6-7.5 10-7.5 10z" />,
  checkbox: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-4.9" />
    </>
  ),
  tracker: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.7h18M3 14.3h18M8 5v14M12.5 5v14M17 5v14" />
    </>
  ),
  list: (
    <>
      <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
      <circle cx="5.2" cy="6.5" r="1" />
      <circle cx="5.2" cy="12" r="1" />
      <circle cx="5.2" cy="17.5" r="1" />
    </>
  ),
  yearGrid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  pixels: (
    <>
      {[4, 10, 16].flatMap((y) =>
        [4, 10, 16].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" />),
      )}
    </>
  ),
  boxes: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9.2h17M3.5 14.8h17M12 3.5v17" />
    </>
  ),
  heading: <path d="M6.5 5v14M17.5 5v14M6.5 12h11" />,
  text: <path d="M5.5 7V5h13v2M12 5v14M9.5 19h5" />,
  todo: (
    <>
      <path d="M4 6.5l1.5 1.5L8 5.5M4 13l1.5 1.5L8 12" />
      <path d="M11 7h9M11 13.5h9M11 19h9M4.5 19h3" />
    </>
  ),
  notes: (
    <>
      <rect x="5.5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9.5 8.5h6M9.5 12h6M9.5 15.5h4M3.5 7.5h3M3.5 12h3M3.5 16.5h3" />
    </>
  ),
  undo: <path d="M9 14.5L4.5 10 9 5.5M4.5 10h10a5 5 0 0 1 0 10H11" />,
  redo: <path d="M15 14.5l4.5-4.5L15 5.5M19.5 10h-10a5 5 0 0 0 0 10H13" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.3h.01M12 17.3h.01" strokeWidth="2.2" />
    </>
  ),
};

export function BlockIcon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      className="block-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] ?? ICONS.notes}
    </svg>
  );
}
