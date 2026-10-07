import React, { useState } from 'react';
import { Habit, RelapseLog } from '../types/habit';

interface AnalyticsScreenProps {
  habit?: Habit;
  habits?: Habit[];
  relapseLogs?: RelapseLog[];
  currentStreakDays?: number;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  habit,
  habits = [],
  currentStreakDays,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habit?.id || habits[0]?.id || '');

  const activeHabit = habits.find((h) => h.id === selectedHabitId) || habit || habits[0];

  if (!activeHabit && habits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-slate-400 bg-[#F5F5F5] dark:bg-slate-950 transition-colors duration-200">
        <p className="text-base font-semibold text-gray-800 dark:text-slate-200">No habit selected</p>
        <p className="text-xs mt-1">Create a habit on the Home screen to view stats.</p>
      </div>
    );
  }

  // Time-based calculations
  const startMs = activeHabit ? new Date(activeHabit.startDate).getTime() : Date.now();
  const daysElapsed = activeHabit
    ? Math.max(0, Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)))
    : currentStreakDays ?? 0;

  const longestStreak = activeHabit ? Math.max(activeHabit.bestStreakDays || 0, daysElapsed) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F2F4F7] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 relative transition-colors duration-200">
      {/* Background Soft Glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#00897B]/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Habit Selector Pill Row */}
      {habits.length > 1 && (
        <div className="px-4 py-3 glass-card border-b border-white/60 dark:border-slate-800 flex gap-2 overflow-x-auto shadow-2xs z-10 transition-colors duration-200">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeHabit?.id === h.id
                  ? 'bg-[#00897B] text-white shadow-md shadow-[#00897B]/20'
                  : 'bg-gray-200/60 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-gray-300/60'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Clean Stats Summary */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 relative">
        {/* 2 Clean Time-Based Metrics */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Days Elapsed */}
          <div className="glass-card rounded-2xl p-5 text-center border border-white/60 dark:border-slate-800/80 flex flex-col items-center justify-center shadow-lg">
            <div className="text-4xl font-black text-[#00897B] dark:text-teal-400 leading-none">
              {daysElapsed}
            </div>
            <div className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mt-3 leading-tight">
              Days Elapsed
            </div>
            <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              24-hour cycles completed
            </div>
          </div>

          {/* Longest Streak */}
          <div className="glass-card rounded-2xl p-5 text-center border border-white/60 dark:border-slate-800/80 flex flex-col items-center justify-center shadow-lg">
            <div className="text-4xl font-black text-emerald-600 dark:text-teal-300 leading-none">
              {longestStreak}
            </div>
            <div className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mt-3 leading-tight">
              Longest Streak
            </div>
            <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              Best consecutive days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
