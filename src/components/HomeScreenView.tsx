import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';
import { MotivationalQuote } from './MotivationalQuote';
import { calculateStreak } from '../utils/dailyLogs';

interface HomeScreenViewProps {
  habits: Habit[];
  onSelectHabit: (id: string) => void;
  onNavigateToDetails: (id: string) => void;
  onNavigateToEdit: (habit: Habit) => void;
  onResetHabit: (habit: Habit) => void;
  onUpdateHabit?: (habit: Habit) => void;
  onAddNewHabit: () => void;
  onDeleteHabit?: (id: string) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  habits,
  onNavigateToEdit,
  onResetHabit,
  onDeleteHabit,
}) => {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitToReset, setHabitToReset] = useState<Habit | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [activeRippleId, setActiveRippleId] = useState<string | null>(null);
  // Day counts only change at 24h boundaries — a 60s tick is plenty.
  // The per-second elapsed label ticks inside each card's <ElapsedTimer />.
  const [minuteTick, setMinuteTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setMinuteTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Derived per-habit numbers. `habits` is in the dependency list, so a
  // `dailyLogs` change from the Stats calendar produces a brand-new habit
  // object and this recomputes — the memoized cards then receive fresh
  // primitives and re-render on their own.
  const cardData = useMemo(
    () =>
      habits.map((habit) => {
        const streak = calculateStreak(habit, minuteTick);
        return {
          habit,
          // The big counter is always elapsed time since the habit started.
          liveDays: streak.elapsedDays,
          // Streak and best are mark-derived, shown in the small badges.
          streakDays: streak.streakDays,
          showStreak: streak.fromMarks,
          bestStreak: streak.bestStreakDays,
          startTimeStr: (() => {
            const d = new Date(habit.startDate);
            return isNaN(d.getTime())
              ? ''
              : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          })(),
        };
      }),
    [habits, minuteTick]
  );

  // Reset-dialog numbers, computed only when the dialog target changes —
  // not on every parent render (the IIFE used to re-run calculateStreak
  // plus a fresh Date on each render while open).
  const resetDialog = useMemo(() => {
    if (!habitToReset) return null;
    const fresh = habits.find((h) => h.id === habitToReset.id) ?? habitToReset;
    const streak = calculateStreak(fresh, Date.now());
    return { fresh, currentDays: streak.elapsedDays, bestDays: streak.bestStreakDays };
  }, [habitToReset, habits]);

  const handleConfirmReset = useCallback(
    (habit: Habit) => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([35, 45, 35]);
      }

      // Resolve the freshest copy by id: the dialog snapshot can be stale if
      // the best-sync effect updated the habit while the dialog was open.
      // Passing a stale startDate would make the reset look like it did nothing.
      const freshHabit = habits.find((h) => h.id === habit.id) ?? habit;

      setResettingId(freshHabit.id);
      setActiveRippleId(freshHabit.id);

      setTimeout(() => {
        onResetHabit(freshHabit);
        setResettingId(null);
        setHabitToReset(null);
      }, 250);

      setTimeout(() => {
        setActiveRippleId(null);
      }, 600);
    },
    [habits, onResetHabit]
  );

  const handleConfirmDelete = useCallback(
    (habit: Habit) => {
      setHabitToDelete(null);
      if (onDeleteHabit) {
        onDeleteHabit(habit.id);
      }
    },
    [onDeleteHabit]
  );

  return (
    <div className="home-stage flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-[#070D19] text-slate-100 relative transition-colors duration-200">
      {/* Local backdrop: athletic runners + readability overlay + soft glows */}
      <div className="home-bg" aria-hidden="true" />
      <div className="home-overlay" aria-hidden="true" />
      {/* Animated Background Soft Breathing Glow Spots */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none z-[1] animate-breathing-glow" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none z-[1] animate-breathing-glow" style={{ animationDelay: '3s' }} />

      {/* Empty State — the bottom bar's + creates habits. */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-20 text-center z-10"
        >
          <div className="wordmark-enter px-1 text-xl font-extrabold tracking-wide text-white drop-shadow-md transition-all duration-200 ease-in-out">
            No habits yet
          </div>
          <p className="premium-meta mt-2 max-w-[15rem] text-sm font-normal leading-relaxed text-gray-200 drop-shadow-sm transition-all duration-200 ease-in-out">
            Tap + in the bar below to start building your momentum.
          </p>
        </motion.div>
      ) : (
        /* Habit grid with live timers */
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 pt-20 pb-24 z-10 relative flex flex-col gap-[var(--list-gap)]"
        >
          <AnimatePresence>
            {cardData.map(
              ({ habit, liveDays, streakDays, showStreak, bestStreak, startTimeStr }, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={index}
                liveDays={liveDays}
                streakDays={streakDays}
                showStreak={showStreak}
                bestStreak={bestStreak}
                startTimeStr={startTimeStr}
                isResetting={resettingId === habit.id}
                hasRipple={activeRippleId === habit.id}
                onEdit={onNavigateToEdit}
                onDeleteRequest={setHabitToDelete}
                onResetRequest={setHabitToReset}
              />
            )
          )}
          </AnimatePresence>
        </div>
      )}

      {/* Floating motivational quote above the bottom bar */}
      <MotivationalQuote />

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {resetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="bg-gray-900/25 backdrop-blur-xl rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl"
            >
              <h3 className="premium-title font-extrabold tracking-wide text-white drop-shadow-md leading-relaxed transition-all duration-200 ease-in-out">
                Reset &ldquo;{resetDialog.fresh.name}&rdquo;?
              </h3>
              <p className="premium-meta text-sm font-normal text-white leading-relaxed drop-shadow-md px-1 transition-all duration-200 ease-in-out">
                Elapsed: <b>{resetDialog.currentDays}d</b> &rarr; 0. Best streak{' '}
                <b>{resetDialog.bestDays}d</b> &rarr; 0. All calendar marks are cleared.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToReset(null)}
                  className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md font-semibold text-gray-200 shadow-xl cursor-pointer hover:scale-105 hover:-translate-y-1 hover:bg-white/20 hover:text-white active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleConfirmReset(resetDialog.fresh)}
                  className="px-5 py-2 text-xs font-bold tracking-wide text-white drop-shadow-md rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-1 active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Reset Streak
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {habitToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="bg-gray-900/25 backdrop-blur-xl rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl"
            >
              <h3 className="premium-title font-extrabold tracking-wide text-white drop-shadow-md leading-relaxed transition-all duration-200 ease-in-out">Delete &ldquo;{habitToDelete.name}&rdquo;?</h3>
              <p className="premium-meta text-sm font-normal text-white leading-relaxed drop-shadow-md px-1 transition-all duration-200 ease-in-out">
                Permanently remove this habit and all its history?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToDelete(null)}
                  className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md font-semibold text-gray-200 shadow-xl cursor-pointer hover:scale-105 hover:-translate-y-1 hover:bg-white/20 hover:text-white active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleConfirmDelete(habitToDelete)}
                  className="px-5 py-2 text-xs font-bold tracking-wide text-white drop-shadow-md rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-1 active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
