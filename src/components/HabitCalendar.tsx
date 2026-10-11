import React from 'react';
import { Check, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { Habit, DailyStatus } from '../types/habit';
import {
  buildMonthGrid,
  getDailyStatus,
  summarizeMonth,
  toDateKey,
  MONTH_NAMES,
  WEEKDAY_LABELS,
} from '../utils/dailyLogs';

interface HabitCalendarProps {
  habit: Habit;
  onSelectDay: (dateKey: string) => void;
  /** Re-render trigger for the live "today" ring (App ticks this every minute). */
  nowMs: number;
}

/* 42px cells keep a comfortable 44px+ tap target on a narrow phone. */
const CELL = 'h-11 w-full min-w-0 rounded-xl text-sm font-black';
const FUTURE = 'bg-transparent border border-transparent text-slate-600 cursor-default font-medium';

/**
 * Month grid with per-day marks. Purely presentational: it reports the tapped
 * date upward and never mutates anything itself.
 */
export const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, onSelectDay, nowMs }) => {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date(nowMs);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Follow the user into a new month when the clock rolls over while open.
  React.useEffect(() => {
    const now = new Date(nowMs);
    setCursor((prev) =>
      prev.getFullYear() === now.getFullYear() && prev.getMonth() === now.getMonth()
        ? prev
        : new Date(now.getFullYear(), now.getMonth(), 1)
    );
  }, [nowMs]);

  const startMs = new Date(habit.startDate).getTime();
  const cells = React.useMemo(() => buildMonthGrid(cursor, startMs), [cursor, startMs]);
  const stats = React.useMemo(() => summarizeMonth(habit.dailyLogs, cells), [habit.dailyLogs, cells]);

  const isCurrentMonth =
    cursor.getFullYear() === new Date(nowMs).getFullYear() &&
    cursor.getMonth() === new Date(nowMs).getMonth();

  const goMonth = (delta: number) =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const monthTitle = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <section className="stat-glass rounded-2xl p-4">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
          className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100 active:bg-white/15"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <div className="premium-title truncate text-lg font-extrabold text-white drop-shadow-md">{monthTitle}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-100 drop-shadow-sm">
            {stats.done} done · {stats.skipped} skipped
          </div>
        </div>

        <button
          type="button"
          onClick={() => goMonth(1)}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100 active:bg-white/15 disabled:opacity-25 disabled:pointer-events-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-black uppercase tracking-[0.08em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
          >
            {label.slice(0, 1)}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          const status: DailyStatus = getDailyStatus(habit.dailyLogs, cell.key);

          let tone: string;
          let content: React.ReactNode = cell.day;

          if (cell.isFuture) {
            tone = FUTURE;
          } else if (status === 'done') {
            tone = 'stat-day-done';
            content = <Check className="mx-auto h-[18px] w-[18px]" strokeWidth={3.5} />;
          } else if (status === 'skipped') {
            tone = 'stat-day-skipped';
            content = <Minus className="mx-auto h-[18px] w-[18px]" strokeWidth={3.5} />;
          } else {
            tone = 'stat-day' + (cell.beforeStart ? ' opacity-45' : '');
          }

          return (
            <button
              key={cell.key}
              type="button"
              disabled={cell.isFuture}
              onClick={() => onSelectDay(cell.key)}
              aria-label={`${cell.key} — ${status}`}
              className={`${CELL} flex items-center justify-center ${tone} ${
                cell.isToday ? 'stat-day-today font-extrabold' : ''
              } ${cell.inMonth ? '' : 'opacity-45'} ${
                cell.isFuture ? '' : 'active:scale-95'
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-white/10 pt-3">
        {[
          { label: 'Done', cls: 'bg-white border border-white/70' },
          { label: 'Skipped', cls: 'bg-zinc-500 border border-zinc-400/70' },
          { label: 'Unmarked', cls: 'bg-white/15 border border-white/25' },
          { label: 'Today', cls: 'bg-white/20 border-2 border-white' },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${item.cls}`} />
            <span className="text-[11px] font-bold text-white drop-shadow-sm">{item.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
};

/** Exposed for the sheet's date formatting. */
export const formatDayLabel = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export { toDateKey };