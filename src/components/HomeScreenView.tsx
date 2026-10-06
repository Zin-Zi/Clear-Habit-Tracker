import React, { useState, useEffect, useRef } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recentlyResetId, setRecentlyResetId] = useState<string | null>(null);

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
    // 1. Trigger haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([35, 45, 35]);
    }
    // 2. Trigger color flash & scale pulse
    setRecentlyResetId(habit.id);
    setTimeout(() => setRecentlyResetId(null), 800);

    onResetHabit(habit);
    setHabitToReset(null);
  };

  const handleConfirmDelete = (habit: Habit) => {
    setDeletingId(habit.id);
    setHabitToDelete(null);
    setTimeout(() => {
      if (onDeleteHabit) onDeleteHabit(habit.id);
      setDeletingId(null);
    }, 240);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] text-gray-900 relative">
      {/* Empty State */}
      {habits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-card-enter">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl mb-4 text-[#00897B]">
            🌱
          </div>
          <div className="text-xl font-bold text-gray-900">No habits yet</div>
          <p className="text-sm text-gray-500 mt-1 mb-6 max-w-xs">
            Start tracking your habits and build long-lasting streaks.
          </p>
          <button
            onClick={onAddNewHabit}
            className="w-full max-w-xs h-12 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Habit</span>
          </button>
        </div>
      ) : (
        /* Modern Cards Habit List with Staggered Fade-in & Slide-up */
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24"
        >
          {habits.map((habit, index) => {
            const start = new Date(habit.startDate).getTime();
            const liveDays = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
            const bestStreak = Math.max(habit.bestStreakDays, liveDays);
            const isDeleting = deletingId === habit.id;
            const isResetting = recentlyResetId === habit.id;

            return (
              <div
                key={habit.id}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={`bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-between transition-all select-none cursor-pointer hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] ${
                  isDeleting ? 'animate-card-exit' : 'animate-card-enter'
                }`}
                onClick={() => onNavigateToEdit(habit)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setHabitToDelete(habit);
                }}
                title="Tap to edit, long-press to delete"
              >
                {/* Left side: Habit name & Best streak */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform active:scale-95"
                    style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                  >
                    {habit.icon || '🛡️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-gray-900 truncate">
                      {habit.name}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">
                      Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>

                {/* Right side: Day count with count transition / pulse effect + Reset button */}
                <div className="flex items-center gap-3.5 shrink-0 pl-2">
                  <div className="text-right">
                    <div
                      key={`${habit.id}-${liveDays}`}
                      className={`text-[32px] font-black leading-none tracking-tight transition-all ${
                        isResetting
                          ? 'animate-number-pulse text-[#00897B]'
                          : 'text-gray-900'
                      }`}
                    >
                      {liveDays}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                      {liveDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>

                  {/* Modern Reset Icon Button with 0.95x scale-down & teal ripple */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHabitToReset(habit);
                    }}
                    aria-label={`Reset streak for ${habit.name}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00897B] hover:bg-[#00897B]/10 active:scale-95 transition-all relative overflow-hidden"
                    title="Reset streak"
                  >
                    <RotateCcw className="w-4 h-4 transition-transform active:rotate-45" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) with Teal Accent, Bounce, and Scroll Shrink (0.9x) */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={onAddNewHabit}
          aria-label="Add new habit"
          className={`w-14 h-14 rounded-full bg-[#00897B] hover:bg-[#00796B] text-white flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 ${
            isScrollingDown ? 'scale-90 shadow-md opacity-90' : 'scale-100 shadow-lg opacity-100'
          }`}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {habitToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-enter">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Reset "{habitToReset.name}"?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This will reset your current streak back to day 0. Your best streak will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHabitToReset(null)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReset(habitToReset)}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
              >
                Reset Streak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-enter">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Delete "{habitToDelete.name}"?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Permanently remove this habit and all its history?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHabitToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(habitToDelete)}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
