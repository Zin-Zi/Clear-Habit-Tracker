import React, { useState, useRef } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../types/habit';

interface HomeScreenViewProps {
  habits: Habit[];
  onSelectHabit: (id: string) => void;
  onNavigateToDetails: (id: string) => void;
  onNavigateToEdit: (habit: Habit) => void;
  onResetHabit: (habit: Habit) => void;
  onAddNewHabit: () => void;
  onDeleteHabit?: (id: string) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  habits,
  onNavigateToEdit,
  onResetHabit,
  onAddNewHabit,
  onDeleteHabit,
}) => {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitToReset, setHabitToReset] = useState<Habit | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // FAB scroll behavior: shrink on scroll down, expand on scroll up
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const currentScrollTop = scrollContainerRef.current.scrollTop;
    if (currentScrollTop > lastScrollTop.current && currentScrollTop > 40) {
      setIsScrollingDown(true);
    } else {
      setIsScrollingDown(false);
    }
    lastScrollTop.current = currentScrollTop;
  };

  const handleConfirmReset = (habit: Habit) => {
    // Trigger haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([35, 45, 35]);
    }

    setResettingId(habit.id);
    setTimeout(() => {
      onResetHabit(habit);
      setResettingId(null);
      setHabitToReset(null);
    }, 300);
  };

  const handleConfirmDelete = (habit: Habit) => {
    setHabitToDelete(null);
    if (onDeleteHabit) {
      onDeleteHabit(habit.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] dark:bg-slate-950 text-gray-900 dark:text-slate-100 relative transition-colors duration-200">
      {/* Empty State */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 flex items-center justify-center text-2xl mb-4 text-[#00897B] dark:text-teal-400">
            🌱
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-slate-100">No habits yet</div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-6 max-w-xs">
            Start tracking your habits and build long-lasting streaks.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddNewHabit}
            className="w-full max-w-xs h-12 rounded-xl bg-[#00897B] hover:bg-[#00796B] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Habit</span>
          </motion.button>
        </motion.div>
      ) : (
        /* Modern Cards Habit List with Staggered Framer Motion Animations */
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24"
        >
          <AnimatePresence>
            {habits.map((habit, index) => {
              const start = new Date(habit.startDate).getTime();
              const liveDays = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
              const bestStreak = Math.max(habit.bestStreakDays, liveDays);
              const isResetting = resettingId === habit.id;

              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    x: [0, -8, 8, -8, 8, 0],
                    opacity: 0,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.35 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                    delay: index * 0.08,
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-shadow select-none cursor-pointer hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] dark:hover:border-slate-700"
                  onClick={() => onNavigateToEdit(habit)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    try {
                      Haptics.impact({ style: ImpactStyle.Heavy });
                    } catch {}
                    setHabitToDelete(habit);
                  }}
                  title="Tap to edit, long-press to delete"
                >
                  {/* Left side: Habit icon, name & Best streak */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform"
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      {habit.icon || '🛡️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold text-gray-900 dark:text-slate-100 truncate">
                        {habit.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                        Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Day count with count-up scale pulse & reset button */}
                  <div className="flex items-center gap-3.5 shrink-0 pl-2">
                    <div className="text-right overflow-hidden py-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${habit.id}-${isResetting ? 0 : liveDays}`}
                          initial={isResetting ? { y: -16, opacity: 0 } : { scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: [1, 1.25, 1],
                            color: isResetting ? ['#EF4444', '#00897B'] : ['#00897B', '#111827'],
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{ y: 16, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="text-[32px] font-black leading-none tracking-tight"
                        >
                          {isResetting ? 0 : liveDays}
                        </motion.div>
                      </AnimatePresence>
                      <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">
                        {liveDays === 1 ? 'day' : 'days'}
                      </div>
                    </div>

                    {/* Reset Icon Button */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          Haptics.impact({ style: ImpactStyle.Medium });
                        } catch {}
                        setHabitToReset(habit);
                      }}
                      aria-label={`Reset streak for ${habit.name}`}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-[#00897B] dark:hover:text-teal-400 hover:bg-[#00897B]/10 dark:hover:bg-teal-400/10 transition-colors relative overflow-hidden"
                      title="Reset streak"
                    >
                      <motion.div
                        animate={isResetting ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="absolute bottom-6 right-6 z-20">
        <motion.button
          animate={{
            scale: isScrollingDown ? 0.9 : [1, 1.04, 1],
          }}
          transition={{
            scale: {
              repeat: isScrollingDown ? 0 : Infinity,
              repeatType: 'reverse',
              duration: 2.5,
              ease: 'easeInOut',
            },
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            try {
              Haptics.impact({ style: ImpactStyle.Light });
            } catch {}
            onAddNewHabit();
          }}
          aria-label="Add new habit"
          className="w-14 h-14 rounded-full bg-[#00897B] hover:bg-[#00796B] dark:bg-teal-600 dark:hover:bg-teal-500 text-white flex items-center justify-center shadow-lg transition-colors group"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
        </motion.button>
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {habitToReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100 dark:border-slate-800"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Reset "{habitToReset.name}"?</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                This will reset your current streak back to day 0. Your best streak will be preserved.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToReset(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleConfirmReset(habitToReset)}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100 dark:border-slate-800"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Delete "{habitToDelete.name}"?</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Permanently remove this habit and all its history?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToDelete(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleConfirmDelete(habitToDelete)}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
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
