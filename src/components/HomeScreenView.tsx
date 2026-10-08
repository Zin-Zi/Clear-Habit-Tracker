import React, { useState, useEffect, useRef } from 'react';
import { Plus, RotateCcw, Clock } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../types/habit';

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

const formatStartTime = (startIso: string): string => {
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

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
  const [activeRippleId, setActiveRippleId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  // Ticking live timer every second for real-time elapsed time display
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([35, 45, 35]);
    }

    setResettingId(habit.id);
    setActiveRippleId(habit.id);

    setTimeout(() => {
      onResetHabit(habit);
      setResettingId(null);
      setHabitToReset(null);
    }, 250);

    setTimeout(() => {
      setActiveRippleId(null);
    }, 600);
  };

  const handleConfirmDelete = (habit: Habit) => {
    setHabitToDelete(null);
    if (onDeleteHabit) {
      onDeleteHabit(habit.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200/60 dark:bg-[#070D19] text-gray-900 dark:text-slate-100 relative transition-colors duration-200">
      {/* Animated Background Soft Breathing Glow Spots */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00897B]/20 dark:bg-teal-400/15 rounded-full blur-3xl pointer-events-none z-0 animate-breathing-glow" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-500/15 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none z-0 animate-breathing-glow" style={{ animationDelay: '3s' }} />

      {/* Empty State */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10"
        >
          <div className="w-16 h-16 glass-card rounded-2xl shadow-xl flex items-center justify-center text-2xl mb-4 text-[#00897B] dark:text-teal-400 border border-white/60 dark:border-slate-800">
            🌱
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-slate-100">No habits yet</div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-6 max-w-xs">
            Tap the + button to start building your momentum.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onAddNewHabit}
            className="w-full max-w-xs h-12 rounded-2xl bg-[#00897B] hover:bg-[#00796B] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00897B]/25 dark:shadow-teal-900/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Habit</span>
          </motion.button>
        </motion.div>
      ) : (
        /* Modern Glassmorphic Cards Habit List with Live Timer */
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28 z-10 relative"
        >
          <AnimatePresence>
            {habits.map((habit, index) => {
              const startMs = new Date(habit.startDate).getTime();
              const liveDays = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));
              const bestStreak = Math.max(habit.bestStreakDays || 0, liveDays);
              const isResetting = resettingId === habit.id;
              const hasRipple = activeRippleId === habit.id;
              const elapsedTimeStr = formatElapsedTime(habit.startDate, nowMs);
              const startTimeStr = formatStartTime(habit.startDate);

              return (
                <motion.div
                  key={habit.id}
                  layout
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
                  className="glass-card rounded-2xl p-4.5 flex items-center justify-between transition-all select-none cursor-pointer relative overflow-hidden group hover:border-[#00897B]/40 dark:hover:border-teal-500/40 hover:shadow-xl hover:shadow-[#00897B]/10"
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
                  {/* Left Accent Bar - Gradient Glow with Blended Color */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none transition-all opacity-35 group-hover:opacity-50"
                    style={{
                      background: `linear-gradient(to right, ${habit.color || '#00897B'}, ${habit.color ? `${habit.color}88` : '#2563EB88'}, transparent)`,
                    }}
                  />
                  <div
                    className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full transition-all"
                    style={{ backgroundColor: habit.color || '#00897B' }}
                  />

                  {/* Soft Internal Card Glow */}
                  <div
                    className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-20 pointer-events-none blur-2xl transition-opacity group-hover:opacity-35"
                    style={{ backgroundColor: habit.color || '#00897B' }}
                  />

                  {/* Water Wave Ripple Effect */}
                  <AnimatePresence>
                    {hasRipple && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-[#00897B]/25 dark:bg-teal-400/35 border-2 border-[#00897B]/50 dark:border-teal-300/60 pointer-events-none z-10"
                      />
                    )}
                  </AnimatePresence>

                  {/* Left side: Icon, Habit Name, Start Time & Live Elapsed Timer */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-1 pl-1 z-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform shadow-xs border border-white/40 dark:border-slate-800"
                      style={{ backgroundColor: `${habit.color || '#00897B'}1f`, color: habit.color || '#00897B' }}
                    >
                      {habit.icon || '🛡️'}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-gray-900 dark:text-slate-100 truncate tracking-tight">
                          {habit.name}
                        </span>
                        {/* "Best" Badge - Circular Shape & Complementary Soft Teal/Amber Tint */}
                        <div
                          className="w-6 h-6 rounded-full bg-[#00897B]/15 dark:bg-teal-400/20 text-[#00897B] dark:text-teal-300 border border-[#00897B]/30 dark:border-teal-400/30 flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs"
                          title={`Best streak: ${bestStreak} days`}
                        >
                          {bestStreak}d
                        </div>
                      </div>
                      {startTimeStr && (
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate">
                          Start: {startTimeStr}
                        </div>
                      )}
                      {/* Elapsed Time - Single Line & Readable Size */}
                      <div className="text-xs font-bold text-[#00897B] dark:text-teal-400 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span className="whitespace-nowrap">Elapsed: {elapsedTimeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: 24-hour cycle day count & reset button */}
                  <div className="flex items-center gap-3.5 shrink-0 pl-2 z-0">
                    <div className="text-right overflow-hidden py-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${habit.id}-${isResetting ? 0 : liveDays}`}
                          initial={{ opacity: 0, y: isResetting ? -12 : -8 }}
                          animate={{
                            scale: isResetting ? [1, 1.2, 1] : 1,
                            color: isResetting ? '#00897B' : undefined,
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{ y: 12, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="text-[32px] font-black leading-none tracking-tight text-gray-900 dark:text-slate-100"
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
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
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
          animate={{ scale: isScrollingDown ? 0.9 : 1 }}
          transition={{ duration: 0.18 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            try {
              Haptics.impact({ style: ImpactStyle.Light });
            } catch {}
            onAddNewHabit();
          }}
          aria-label="Add new habit"
          className="w-14 h-14 rounded-full bg-[#00897B] hover:bg-[#00796B] dark:bg-teal-600 dark:hover:bg-teal-500 text-white flex items-center justify-center shadow-xl shadow-[#00897B]/30 dark:shadow-teal-900/40 border border-white/20 transition-colors group"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.15 }}>
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-card rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-2xl border border-white/60 dark:border-slate-800"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Reset "{habitToReset.name}"?</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                This will reset your current streak back to day 0. Your best streak will be preserved.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToReset(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-800/80 transition-colors"
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-card rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-2xl border border-white/60 dark:border-slate-800"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Delete "{habitToDelete.name}"?</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Permanently remove this habit and all its history?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToDelete(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-800/80 transition-colors"
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
