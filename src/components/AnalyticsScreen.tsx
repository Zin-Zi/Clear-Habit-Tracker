import React, { useState } from 'react';
import { Habit, RelapseLog } from '../types/habit';

interface AnalyticsScreenProps {
  habit?: Habit;
  habits?: Habit[];
  relapseLogs: RelapseLog[];
  currentStreakDays?: number;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  habit,
  habits = [],
  relapseLogs = [],
  currentStreakDays,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habit?.id || habits[0]?.id || '');

  const activeHabit = habits.find((h) => h.id === selectedHabitId) || habit || habits[0];

  // Calculations
  const startMs = activeHabit ? new Date(activeHabit.startDate).getTime() : Date.now();
  const createdMs = activeHabit?.createdAt ? new Date(activeHabit.createdAt).getTime() : startMs;
  const liveStreak = activeHabit
    ? Math.max(0, Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)))
    : currentStreakDays ?? 0;
  
  const bestStreak = activeHabit ? Math.max(activeHabit.bestStreakDays || 0, liveStreak) : 0;
  
  // Total days tracked
  const totalDays = activeHabit
    ? Math.max(liveStreak, Math.max(1, Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24)) + 1))
    : 0;

  // Filter and sort relapse logs (most recent first)
  const habitLogs = (
    activeHabit
      ? relapseLogs.filter((l) => l.habitId === activeHabit.id)
      : relapseLogs
  ).slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (!activeHabit && habits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 bg-[#F5F5F5]">
        <p className="text-base font-semibold text-gray-800">No habit selected</p>
        <p className="text-xs mt-1">Create a habit on the Home screen to view stats.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] text-gray-900">
      {/* Habit selector if multiple habits exist */}
      {habits.length > 1 && (
        <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto shadow-xs">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeHabit?.id === h.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Stats with Modern Cards and Shadows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top 3 Large Number Metrics in Modern White Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Current streak */}
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-teal-600 leading-none">
              {liveStreak}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase mt-2 leading-tight">
              Current
            </div>
            <div className="text-[10px] text-gray-400 font-medium">streak</div>
          </div>

          {/* Best streak */}
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-blue-600 leading-none">
              {bestStreak}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase mt-2 leading-tight">
              Best
            </div>
            <div className="text-[10px] text-gray-400 font-medium">streak</div>
          </div>

          {/* Total days */}
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-amber-600 leading-none">
              {totalDays}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase mt-2 leading-tight">
              Total
            </div>
            <div className="text-[10px] text-gray-400 font-medium">days</div>
          </div>
        </div>

        {/* Relapse History Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Relapse History
            </h3>
            <span className="text-xs font-bold text-gray-400">
              {habitLogs.length} {habitLogs.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {habitLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm font-medium">
              No relapses logged
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {habitLogs.map((log) => {
                const date = new Date(log.timestamp);
                const formattedDate = date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = date.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {formattedDate}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formattedTime}
                      </div>
                    </div>
                    {log.notes && log.notes !== 'Reset' && (
                      <div className="text-xs text-gray-500 italic max-w-[150px] truncate text-right">
                        {log.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
