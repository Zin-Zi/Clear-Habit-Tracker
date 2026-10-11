import React, { useState, useEffect } from 'react';
import { RotateCcw, Pencil, CalendarClock } from 'lucide-react';
import { tapHeavy, tapMedium } from '../services/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../types/habit';
import { subscribeTick } from '../services/ticker';

const formatElapsedTime = (startIso: string, nowMs: number): string => {
  const startMs = new Date(startIso).getTime();
  const diffMs = Math.max(0, nowMs - startMs);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
};

/* Reads a px CSS variable (the single source for card scale). */
const readCardVar = (name: string, fallback: number): number => {
  if (typeof window === 'undefined') return fallback;
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (full.length !== 6) return `rgba(139, 92, 246, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(139, 92, 246, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* Elapsed-time ring on the shared 1s clock — one timer for all cards, and
   the card itself never re-renders ticking (only this memo leaf does). */
const ElapsedRing: React.FC<{ startIso: string; progress: number; accent: string; ringId: string }> = React.memo(
  ({ startIso, progress, accent, ringId }) => {
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => subscribeTick(setNowMs), []);

    const size = readCardVar('--ring-size', 84);
    const stroke = readCardVar('--ring-stroke', 6.5);
    const r = (size - stroke) / 2 - 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, progress));
    const pctLabel = Math.floor(pct * 100);
    const gid = `elapsed-ring-${ringId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    return (
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        title={`Elapsed: ${formatElapsedTime(startIso, nowMs)} — ${pctLabel}% of target`}
        aria-label={`Elapsed ${formatElapsedTime(startIso, nowMs)}, ${pctLabel} percent of target`}
      >
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke + 6}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            opacity={0.3}
            className="halo-breathe"
            style={{ transition: 'stroke-dashoffset var(--dur-ring, 300ms) ease-out' }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="ring-arc"
            style={{
              transition: 'stroke-dashoffset var(--dur-ring, 300ms) ease-out',
              filter: `drop-shadow(0 0 8px ${hexToRgba(accent, 0.7)})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="whitespace-nowrap text-[10px] font-bold leading-tight tabular-nums text-white drop-shadow-sm">
            {formatElapsedTime(startIso, nowMs)}
          </span>
          <span className="mt-0.5 text-[9px] font-black tabular-nums tracking-widest text-zinc-400 drop-shadow-sm">
            {pctLabel}%
          </span>
        </div>
      </div>
    );
  }
);
/* Renders the exact emoji stored by the Edit screen.
   Memoized: static per card except on habit edits. */
const HabitIcon: React.FC<{ icon?: string; label: string; color: string }> = React.memo(({ icon, label, color }) => {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md text-base leading-none select-none cursor-pointer hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-200 ease-in-out"
      style={{
        backgroundColor: `${color}30`,
        boxShadow: `0 12px 28px -6px ${hexToRgba(color, 0.55)}, 0 0 22px ${hexToRgba(color, 0.4)}`,
      }}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">{icon || '🛡️'}</span>
    </div>
  );
});

interface HabitCardProps {
  habit: Habit;
  index: number;
  liveDays: number;
  /** Mark-derived streak, rendered as the small badge. */
  streakDays: number;
  /** Only render the streak badge once the user has calendar marks. */
  showStreak: boolean;
  bestStreak: number;
  startTimeStr: string;
  isResetting: boolean;
  hasRipple: boolean;
  onEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
  onResetRequest: (habit: Habit) => void;
}

/* Memoized: only its own habit data, counts, or flags re-render it. */
export const HabitCard: React.FC<HabitCardProps> = React.memo(({
  habit,
  index,
  liveDays,
  streakDays,
  showStreak,
  bestStreak,
  startTimeStr,
  isResetting,
  hasRipple,
  onEdit,
  onDeleteRequest,
  onResetRequest,
}) => {
  const accent = habit.color || '#E4E4E7';
  const targetDays = Math.max(habit.targetDays || 90, 1);
  const pct = Math.max(0, Math.min(1, liveDays / targetDays));
  const pctLabel = Math.floor(pct * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 30,
        delay: index * 0.04,
      }}
      whileTap={{ scale: 0.97 }}
      className="habit-card-luxe shadow-[0_18px_50px_-10px_rgba(0,0,0,0.8)] rounded-2xl p-[var(--card-pad)] flex flex-row items-center gap-[var(--card-gap)] min-h-[var(--card-min-h)] shrink-0 transition-all duration-200 ease-in-out select-none cursor-pointer relative overflow-hidden group border border-white/10"
      style={{ ['--glow' as string]: hexToRgba(accent, 0.55) }}
      onClick={() => onEdit(habit)}
      onContextMenu={(e) => {
        e.preventDefault();
        try {
          tapHeavy();
        } catch {}
        onDeleteRequest(habit);
      }}
      title={`Tap to edit, long-press to delete${startTimeStr ? ` — started ${startTimeStr}` : ''} — Best streak ${bestStreak}d${showStreak ? `, ${streakDays}d marked` : ''}`}
      aria-label={`${habit.name}, ${liveDays} days, ${pctLabel} percent of ${targetDays} day goal, best streak ${bestStreak} days`}
    >
      {/* Ambient accent glow. */}
      <div
        className="absolute -left-16 -top-16 w-56 h-56 rounded-full opacity-20 pointer-events-none blur-xl glow-breathe transition-all duration-200 ease-in-out group-hover:opacity-30"
        style={{ backgroundColor: accent }}
      />

      {/* Ripple */}
      <AnimatePresence>
        {hasRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white/25 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Left half: progress ring only */}
      <ElapsedRing
        startIso={habit.startDate}
        progress={pct}
        accent={accent}
        ringId={habit.id}
      />

      {/* Right half: everything else, stacked */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 z-0">
        <div className="flex items-center gap-2 min-w-0">
          <HabitIcon icon={habit.icon} label={habit.name} color={accent} />
          <div className="font-display text-[13px] font-extrabold leading-snug tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] truncate flex-1 min-w-0">
            {habit.name}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(habit);
            }}
            aria-label={`Edit ${habit.name}`}
            title="Edit habit"
            className="tap-44 w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-0.5 hover:scale-110 hover:bg-white/30 hover:shadow-white/40 active:scale-95 transition-all duration-200 ease-in-out"
          >
            <Pencil className="w-3 h-3" strokeWidth={2.5} />
          </motion.button>
        </div>
        <div className="min-w-0">
          <div className="premium-meta text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-100/90 drop-shadow-sm">
            Current streak
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 leading-none">
            <span className="drop-shadow-[0_2px_16px_rgba(255,255,255,0.35)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${habit.id}-${isResetting ? 0 : liveDays}`}
                initial={{ opacity: 0, y: isResetting ? -12 : -8 }}
                animate={{
                  scale: isResetting ? [1, 1.2, 1] : 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="font-display text-4xl font-extrabold leading-none tracking-tight tabular-nums bg-gradient-to-b from-white via-white to-gray-300 bg-clip-text text-transparent"
              >
                {isResetting ? 0 : liveDays}
              </motion.div>
            </AnimatePresence>
            </span>
            <div className="font-display text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 drop-shadow-sm">
              {liveDays === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          {startTimeStr ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <CalendarClock className="w-3 h-3 shrink-0 text-zinc-100/80 drop-shadow-sm" strokeWidth={2.5} />
              <span className="premium-meta text-[11px] font-medium tracking-wide text-gray-300 drop-shadow-sm whitespace-nowrap truncate">
                Started {startTimeStr}
              </span>
            </div>
          ) : (
            <span />
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              try {
                tapMedium();
              } catch {}
              onResetRequest(habit);
            }}
            aria-label={`Reset streak for ${habit.name}`}
            title="Reset streak"
            className="tap-44 w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-0.5 hover:scale-110 hover:bg-white/30 hover:shadow-white/40 active:scale-95 transition-all duration-200 ease-in-out"
          >
            <motion.span
              animate={isResetting ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});
