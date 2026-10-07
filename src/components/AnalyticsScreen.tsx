import React, { useState } from 'react';
import { Habit, RelapseLog } from '../types/habit';
import { Check } from 'lucide-react';

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

  // Calculate live streak and completion stats
  const startMs = activeHabit ? new Date(activeHabit.startDate).getTime() : Date.now();
  const liveStreak = activeHabit
    ? Math.max(0, Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)))
    : currentStreakDays ?? 0;

  const bestStreak = activeHabit ? Math.max(activeHabit.bestStreakDays || 0, liveStreak) : 0;
  const completedDates = activeHabit?.completedDates || [];
  const totalCompletions = completedDates.length;

  // Past 7 Days Progress Bar Indicator
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const isCompleted = completedDates.includes(dateStr);
    const isToday = i === 6;

    return {
      dateStr,
      dayName,
      isCompleted,
      isToday,
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Habit Selector Pill Row */}
      {habits.length > 1 && (
        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex gap-2 overflow-x-auto shadow-2xs transition-colors duration-200">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeHabit?.id === h.id
                  ? 'bg-[#00897B] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Clean Stats Summary */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Current streak */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-[#00897B] dark:text-teal-400 leading-none">
              {liveStreak}
            </div>
            <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase mt-2 leading-tight">
              Current
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">streak</div>
          </div>

          {/* Best streak */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">
              {bestStreak}
            </div>
            <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase mt-2 leading-tight">
              Best
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">streak</div>
          </div>

          {/* Total completions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
              {totalCompletions}
            </div>
            <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase mt-2 leading-tight">
              Total
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">marked</div>
          </div>
        </div>

        {/* Simple 7-Day Progress Bar Indicator Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400">
              7-Day Progress
            </h3>
            <span className="text-xs font-bold text-[#00897B] dark:text-teal-400">
              {past7Days.filter((d) => d.isCompleted).length} / 7 days
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {past7Days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    day.isCompleted
                      ? 'bg-[#00897B] text-white shadow-xs scale-105'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {day.isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : day.dayName}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    day.isToday
                      ? 'text-[#00897B] dark:text-teal-400 font-bold'
                      : 'text-gray-400 dark:text-slate-500'
                  }`}
                >
                  {day.isToday ? 'Today' : day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
