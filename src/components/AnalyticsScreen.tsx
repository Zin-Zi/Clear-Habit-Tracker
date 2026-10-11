import React, { useState, useCallback } from 'react';
import { CalendarDays, Flame, Trophy, Info, X } from 'lucide-react';
import { Habit, RelapseLog, DailyStatus } from '../types/habit';
import { HabitCalendar, formatDayLabel } from './HabitCalendar';
import { DayActionSheet } from './DayActionSheet';
import { calculateStreak, elapsedDays, findBestRun } from '../utils/dailyLogs';
import { tapLight } from '../services/haptics';

interface AnalyticsScreenProps {
  habit?: Habit;
  habits?: Habit[];
  relapseLogs?: RelapseLog[];
  currentStreakDays?: number;
  /** Persists a single day's status for the given habit. */
  onMarkDay: (habitId: string, dateKey: string, status: DailyStatus) => void;
  /** Live clock so the "Today" ring updates without a remount. */
  nowMs?: number;
}

const DAY_MS = 86400000;
const MILESTONES = [1, 3, 7, 14, 30, 60, 90];

const fmtDate = (d: Date): string =>
  d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const fmtShort = (d: Date): string =>
  d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const fmtDateTime = (d: Date): string =>
  d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** "14h 20m", "3d 2h", "45m" — never empty, never negative. */
const fmtLeft = (ms: number): string => {
  const clamped = Math.max(0, ms);
  const d = Math.floor(clamped / DAY_MS);
  const h = Math.floor((clamped % DAY_MS) / 3600000);
  const m = Math.floor((clamped % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const TOOLTIP = 'Day count = completed 24-hour periods since your last reset.';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
    {children}
  </h3>
);

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  habit,
  habits = [],
  relapseLogs = [],
  currentStreakDays,
  onMarkDay,
  nowMs = Date.now(),
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habit?.id || habits[0]?.id || '');
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const [openTip, setOpenTip] = useState<string | null>(null);

  const activeHabit = habits.find((h) => h.id === selectedHabitId) || habit || habits[0];

  const handleSelectDay = useCallback((dateKey: string) => {
    tapLight();
    setSheetKey(dateKey);
  }, []);

  const handleMark = useCallback(
    (status: DailyStatus) => {
      if (!activeHabit || !sheetKey) return;
      onMarkDay(activeHabit.id, sheetKey, status);
      setSheetKey(null);
    },
    [activeHabit, onMarkDay, sheetKey]
  );

  if (!activeHabit && habits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-950 transition-colors duration-200">
        <p className="text-base font-semibold text-slate-200">No habit selected</p>
        <p className="text-xs mt-1">Create a habit on the Home screen to view stats.</p>
      </div>
    );
  }

  // Single source of truth — the same `calculateStreak` / `elapsedDays` the
  // Habit Cards use, so the calendar, the Stats tiles and Home never disagree.
  const streak = activeHabit
    ? calculateStreak(activeHabit, nowMs)
    : {
        elapsedDays: currentStreakDays ?? 0,
        streakDays: currentStreakDays ?? 0,
        bestStreakDays: 0,
        fromMarks: false,
        doneCount: 0,
        skippedCount: 0,
      };

  const elapsed = streak.elapsedDays;
  const shownStreak = streak.fromMarks ? streak.streakDays : streak.elapsedDays;
  const longest = streak.bestStreakDays;
  const target = Math.max(activeHabit?.targetDays || 90, 1);

  const startMs = activeHabit ? new Date(activeHabit.startDate).getTime() : NaN;
  const startValid = Number.isFinite(startMs) && startMs <= nowMs;
  const startDate = startValid ? new Date(startMs) : new Date(nowMs);

  // Resets + past runs for this habit only.
  const resets = (relapseLogs || []).filter((r) => activeHabit && r.habitId === activeHabit.id);
  const pastRuns = resets
    .map((r) => r.streakDaysAtRelapse || 0)
    .filter((d) => d > 0);
  const averageRun =
    pastRuns.length > 0
      ? (pastRuns.reduce((a, b) => a + b, 0) + elapsed) / (pastRuns.length + 1)
      : null;

  // Goal progress.
  const goalPct = Math.min(100, Math.floor((elapsed / target) * 100));
  const goalLeft = Math.max(0, target - elapsed);

  // Next milestone strictly beyond today.
  const nextMilestone = MILESTONES.find((m) => m > elapsed) ?? null;
  const nextInMs =
    nextMilestone !== null && startValid
      ? new Date(startMs).getTime() + nextMilestone * DAY_MS - nowMs
      : null;

  // Today: Day N in progress + time left in this 24h cycle (live, 1-min tick).
  const intoDay = startValid ? ((nowMs - startMs) % DAY_MS + DAY_MS) % DAY_MS : 0;
  const todayLeft = fmtLeft(DAY_MS - intoDay);

  // Longest caption: live run still going, a recorded range, or not yet.
  const bestRange = findBestRun(resets);
  const longestCaption =
    longest <= 0
      ? 'No best yet — keep going'
      : shownStreak >= longest
      ? 'Still going'
      : bestRange
      ? `Best run: ${fmtShort(bestRange.start)} – ${fmtShort(bestRange.end)}`
      : `Best run: ${longest} days`;

  const isPersonalBest = longest > 0 && shownStreak === longest;

  const toggleTip = (id: string) => {
    tapLight();
    setOpenTip((prev) => (prev === id ? null : id));
  };

  const tipFor = (id: string) =>
    openTip === id ? (
      <div
        role="note"
        className="absolute right-2 top-10 z-20 max-w-[220px] rounded-xl border border-white/15 bg-[#0B1120]/95 p-3 text-[11px] font-medium leading-relaxed text-[#fff] shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <span>{TOOLTIP}</span>
          <button
            type="button"
            onClick={() => setOpenTip(null)}
            aria-label="Close explanation"
            className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    ) : null;

  const infoButton = (id: string, label: string) => (
    <button
      type="button"
      onClick={() => toggleTip(id)}
      aria-label={label}
      aria-expanded={openTip === id}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
    >
      <Info className="h-4 w-4" />
    </button>
  );

  const sheetStatus: DailyStatus =
    sheetKey && activeHabit
      ? activeHabit.dailyLogs?.[sheetKey] ?? 'unmarked'
      : 'unmarked';

  return (
    <div className="home-stage flex-1 flex flex-col h-full overflow-hidden bg-[#070D19] text-slate-100 relative transition-colors duration-200">
      {/* Same photographic backdrop as the Home screen — glassmorphism needs
          something behind the cards to refract, otherwise the "glass" reads as
          flat paint over a solid colour. */}
      <div className="home-bg" aria-hidden="true" />
      <div className="home-overlay" aria-hidden="true" />
      {/* Background Soft Glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Habit Selector Pill Row */}
      {habits.length > 1 && (
        <div className="px-4 py-3 glass-card border-slate-800 flex gap-2 overflow-x-auto shadow-2xs z-10 transition-colors duration-200">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                activeHabit?.id === h.id
                  ? 'bg-white text-zinc-950 shadow-md shadow-black/40'
                  : 'bg-slate-800/80 text-slate-300'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Clean Stats Summary */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-20 space-y-4 z-10 relative">
        <SectionTitle>Overview</SectionTitle>
        {/* 3 metrics: elapsed + the two streak figures, equal height */}
        <div className="grid grid-cols-2 items-stretch gap-3">
          {/* Days Elapsed — always the clock, never the marks */}
          <div className="stat-glass relative rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <CalendarDays className="h-5 w-5 text-teal-300" strokeWidth={2.5} />
              {infoButton('elapsed', 'What does Days Elapsed mean?')}
            </div>
            {tipFor('elapsed')}
            <div className="mt-1 text-4xl font-black leading-none text-[#fff] tabular-nums">
              {elapsed} <span className="text-base font-extrabold">days</span>
            </div>
            <div className="mt-2 text-xs font-semibold leading-snug text-[rgba(255,255,255,0.7)]">
              Total days since you first started this habit
            </div>
            <div className="mt-1 text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              Since {fmtDate(startDate)}
            </div>
          </div>

          {/* Current Streak */}
          <div className="stat-glass relative rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <Flame className="h-5 w-5 text-teal-300" strokeWidth={2.5} />
              {infoButton('streak', 'What does Current Streak mean?')}
            </div>
            {tipFor('streak')}
            <div className="mt-1 text-4xl font-black leading-none text-[#fff] tabular-nums">
              {shownStreak} <span className="text-base font-extrabold">days</span>
            </div>
            {isPersonalBest && (
              <div className="mt-1.5 self-start rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-950">
                Personal best
              </div>
            )}
            <div className="mt-2 text-xs font-semibold leading-snug text-[rgba(255,255,255,0.7)]">
              Days in a row without a reset
            </div>
            <div className="mt-1 text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              Since last reset: {fmtDateTime(startDate)}
            </div>
          </div>

          {/* Longest Streak */}
          <div className="stat-glass relative rounded-2xl p-4 flex flex-col col-span-2">
            <div className="flex items-center justify-between">
              <Trophy className="h-5 w-5 text-teal-300" strokeWidth={2.5} />
              {infoButton('longest', 'What does Longest Streak mean?')}
            </div>
            {tipFor('longest')}
            <div className="mt-1 text-4xl font-black leading-none text-[#fff] tabular-nums">
              {longest} <span className="text-base font-extrabold">days</span>
            </div>
            <div className="mt-2 text-xs font-semibold leading-snug text-[rgba(255,255,255,0.7)]">
              Your best run so far
            </div>
            <div className="mt-1 text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              {longestCaption}
            </div>
          </div>
        </div>

        <SectionTitle>Progress</SectionTitle>
        <div className="stat-glass rounded-2xl p-4 space-y-3">
          {/* Goal progress */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fff]">
                Goal progress
              </span>
              <span className="text-[11px] font-bold tabular-nums text-[#fff]">
                {elapsed} / {target} days · {goalPct}%
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={goalPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Goal progress ${goalPct} percent`}
            >
              <div className="h-full rounded-full bg-white" style={{ width: `${goalPct}%` }} />
            </div>
            <div className="mt-1 text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              {goalLeft} days left
            </div>
          </div>
          {/* Next milestone */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fff]">
              Next milestone
            </span>
            <span className="text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              {nextMilestone !== null && nextInMs !== null
                ? `Next: ${nextMilestone} days (in ${fmtLeft(nextInMs)})`
                : 'All milestones cleared'}
            </span>
          </div>
          {/* Today's status (live) */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fff]">
              Today
            </span>
            <span className="text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              Day {elapsed + 1} in progress, {todayLeft} left
            </span>
          </div>
          {/* Total resets + average run */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fff]">
              Total resets
            </span>
            <span className="text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              {resets.length > 0 ? `${resets.length}` : '– No resets yet'}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fff]">
              Average run
            </span>
            <span className="text-[11px] font-medium tabular-nums text-[rgba(255,255,255,0.7)]">
              {averageRun !== null ? `${averageRun.toFixed(1)} days` : '– Finish a run first'}
            </span>
          </div>
        </div>

        <SectionTitle>Calendar</SectionTitle>
        {/* Monthly calendar with per-day marking */}
        {activeHabit && (
          <HabitCalendar habit={activeHabit} onSelectDay={handleSelectDay} nowMs={nowMs} />
        )}

        <p className="flex items-center justify-center gap-x-4 gap-y-1 px-1 pb-2 text-center text-[11px] font-medium text-[#fff]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
            filled = completed day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border-2 border-white" aria-hidden="true" />
            outlined = today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
            dimmed = skipped
          </span>
        </p>
      </div>

      <DayActionSheet
        open={sheetKey !== null}
        dateLabel={sheetKey ? formatDayLabel(sheetKey) : ''}
        current={sheetStatus}
        onSelect={handleMark}
        onClose={() => setSheetKey(null)}
      />
    </div>
  );
};
