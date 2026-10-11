import { DailyStatus, Habit, RelapseLog } from '../types/habit';

/** Local calendar date as `YYYY-MM-DD`. Uses local time, never UTC, so a
 *  mark made at 11pm in Yangon stays on that day instead of jumping ahead. */
export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const todayKey = (): string => toDateKey(new Date());

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CalendarCell {
  key: string;
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  beforeStart: boolean;
}

/**
 * Builds a 6x7 grid (Monday-first) covering the month of `month`.
 * Leading/trailing days from adjacent months are included and flagged so the
 * grid is always a stable 42 cells — no layout jump when navigating months.
 */
export const buildMonthGrid = (month: Date, habitStartMs?: number): CalendarCell[] => {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const first = new Date(year, mon, 1);
  // JS weeks start Sunday; shift so Monday === 0.
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, mon, 1 - lead);

  const today = todayKey();

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toDateKey(date);
    return {
      key,
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === mon,
      isToday: key === today,
      isFuture: key > today,
      beforeStart: habitStartMs !== undefined && date.getTime() < habitStartMs,
    };
  });
};

/** Read a mark, defaulting to `unmarked`. */
export const getDailyStatus = (
  logs: Record<string, DailyStatus> | undefined,
  key: string
): DailyStatus => logs?.[key] ?? 'unmarked';

/** Immutable write. `unmarked` deletes the key so storage stays compact. */
export const setDailyStatus = (
  logs: Record<string, DailyStatus> | undefined,
  key: string,
  status: DailyStatus
): Record<string, DailyStatus> => {
  const next = { ...(logs || {}) };
  if (status === 'unmarked') {
    delete next[key];
  } else {
    next[key] = status;
  }
  return next;
};

/** Summary counts for the legend, e.g. `{ done: 12, skipped: 2, unmarked: 14 }`. */
export const summarizeMonth = (
  logs: Record<string, DailyStatus> | undefined,
  cells: CalendarCell[]
): Record<Exclude<DailyStatus, 'unmarked'>, number> & { total: number } => {
  const result = { done: 0, skipped: 0, total: 0 };
  for (const cell of cells) {
    if (!cell.inMonth || cell.isFuture) continue;
    result.total++;
    const status = getDailyStatus(logs, cell.key);
    if (status === 'done' || status === 'skipped') result[status]++;
  }
  return result;
};

const DAY_MS = 86400000;

const keyToMs = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

/** Whole 24-hour cycles between `startIso` and `nowMs`. */
export const elapsedDays = (startIso: string, nowMs: number): number => {
  const startMs = new Date(startIso).getTime();
  if (!Number.isFinite(startMs)) return 0;
  return Math.max(0, Math.floor((nowMs - startMs) / DAY_MS));
};

interface HabitStreak {
  /** Big counter on the Habit Card — always elapsed time, never the marks. */
  elapsedDays: number;
  /** Mark-derived streak, shown as the small badge beside the Best badge. */
  streakDays: number;
  /** The "Best" badge on the Habit Card. */
  bestStreakDays: number;
  /** True when `streakDays` comes from calendar marks rather than the clock. */
  fromMarks: boolean;
  doneCount: number;
  skippedCount: number;
}

/**
 * Single source of truth for a habit's numbers.
 *
 * The big counter (`elapsedDays`) is ALWAYS 24-hour cycles since `startDate` —
 * marking days never moves it.
 *
 * `streakDays` is the separate, mark-derived figure shown in the small badge:
 *  - No marks yet  -> falls back to elapsed time, so the badge is hidden.
 *  - Marks exist  -> `done` days extend the run, `skipped` days are a deliberate
 *    pause so they do NOT break it, and unmarked days are neutral.
 *
 * `bestStreakDays` is the longest run of Done marks, floored by the stored best
 * so a historic record is never lost.
 *
 * Pure and cheap: called during render, never mutates anything.
 */
export const calculateStreak = (
  habit: Habit,
  nowMs: number = Date.now()
): HabitStreak => {
  const timeStreak = elapsedDays(habit.startDate, nowMs);
  const storedBest = habit.bestStreakDays || 0;

  const logs = habit.dailyLogs || {};
  const markedKeys = Object.keys(logs).filter((k) => logs[k] === 'done' || logs[k] === 'skipped');

  if (markedKeys.length === 0) {
    return {
      elapsedDays: timeStreak,
      streakDays: timeStreak,
      bestStreakDays: Math.max(storedBest, timeStreak),
      fromMarks: false,
      doneCount: 0,
      skippedCount: 0,
    };
  }

  markedKeys.sort();
  const doneCount = markedKeys.filter((k) => logs[k] === 'done').length;
  const skippedCount = markedKeys.length - doneCount;

  // Walk the marked days in order. A `done` extends the run; a `skipped` day
  // pauses it without breaking it; days with no mark are not in this list and
  // so are ignored entirely.
  let longestRun = 0;
  let run = 0;
  let prevMs: number | null = null;

  for (const key of markedKeys) {
    const ms = keyToMs(key);
    const adjacent = prevMs !== null && ms - prevMs <= DAY_MS * 2;
    if (logs[key] === 'done') {
      run = adjacent ? run + 1 : 1;
      if (run > longestRun) longestRun = run;
    } else {
      // skipped: hold the run, but don't let it extend either.
      run = adjacent ? run : run;
    }
    prevMs = ms;
  }

  // Current run: count back from today. An unmarked today doesn't zero it out
  // (you may not have got to today yet); a `skipped` today pauses it.
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  let cursorMs = today.getTime();
  if (logs[toDateKey(new Date(cursorMs))] === undefined) cursorMs -= DAY_MS;

  let currentRun = 0;
  while (logs[toDateKey(new Date(cursorMs))] === 'done') {
    currentRun++;
    cursorMs -= DAY_MS;
  }

  return {
    elapsedDays: timeStreak,
    streakDays: currentRun || doneCount,
    bestStreakDays: Math.max(storedBest, longestRun),
    fromMarks: true,
    doneCount,
    skippedCount,
  };
};

/** `1 -> Mon ... 7 -> Sun`, matching the Monday-first grid. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface BestRunRange {
  start: Date;
  end: Date;
  days: number;
}

/**
 * Reconstructs the longest completed run from relapse logs: the relapse with
 * the biggest `streakDaysAtRelapse` ended that run, so the run spans
 * [timestamp - days, timestamp]. Null when there is no recorded run yet.
 */
export const findBestRun = (relapses: RelapseLog[] | undefined): BestRunRange | null => {
  let best: BestRunRange | null = null;
  for (const r of relapses || []) {
    const days = r.streakDaysAtRelapse || 0;
    if (days <= 0) continue;
    const end = new Date(r.timestamp);
    if (isNaN(end.getTime())) continue;
    if (!best || days > best.days) {
      best = { start: new Date(end.getTime() - days * DAY_MS), end, days };
    }
  }
  return best;
};