import type { IconType } from 'react-icons';
import {
  LuCalendar,
  LuCalendarRange,
  LuClock,
  LuDroplet,
  LuGrid3X3,
  LuHeading,
  LuHeart,
  LuLayoutGrid,
  LuList,
  LuListTodo,
  LuMoon,
  LuNotebookPen,
  LuRedo2,
  LuSmile,
  LuSquareCheck,
  LuStar,
  LuTable,
  LuTable2,
  LuType,
  LuUndo2,
  LuUtensils,
} from 'react-icons/lu';

/** Icon names used by the block registry (`icon: '...'`) and the editor buttons. */
const ICONS: Record<string, IconType> = {
  clock: LuClock,
  star: LuStar,
  week: LuCalendarRange,
  droplet: LuDroplet,
  moon: LuMoon,
  smile: LuSmile,
  utensils: LuUtensils,
  heart: LuHeart,
  checkbox: LuSquareCheck,
  tracker: LuTable,
  list: LuList,
  yearGrid: LuLayoutGrid,
  pixels: LuGrid3X3,
  boxes: LuTable2,
  heading: LuHeading,
  text: LuType,
  todo: LuListTodo,
  notes: LuNotebookPen,
  undo: LuUndo2,
  redo: LuRedo2,
  calendar: LuCalendar,
};

export function BlockIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? ICONS.notes;
  return <Icon className="block-icon" size={size} aria-hidden="true" />;
}
