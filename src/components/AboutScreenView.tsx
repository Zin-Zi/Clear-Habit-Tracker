import React from 'react';
import { Zap, CheckCircle2, Shield } from 'lucide-react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-5 max-w-md mx-auto w-full space-y-4 bg-[#F2F4F7] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 overflow-y-auto transition-colors duration-200">
      {/* Header Badge Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-gray-100/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00897B] text-white flex items-center justify-center font-black text-xl shadow-xs">
            M
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Momentum
            </h2>
            <p className="text-xs font-semibold text-[#00897B] dark:text-teal-400">
              Clean Habit Tracker
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-[11px] font-mono font-bold text-gray-600 dark:text-slate-300">
          v1.0.0
        </span>
      </div>

      {/* Philosophy Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-gray-100/80 dark:border-slate-800 space-y-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          Philosophy
        </h3>
        <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed font-medium">
          Consistency is the key to mastery. Momentum helps you build daily habits with a distraction-free experience.
        </p>
      </div>

      {/* 3 Practical Benefits Cards */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 px-1">
          Key Benefits
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-gray-100/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#00897B] dark:text-teal-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">Build Discipline</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Build daily consistency day by day.</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-gray-100/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">Accurate Streak Tracking</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Track 24-hour cycles with live elapsed timers.</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-gray-100/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">100% Offline & Private</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Distraction-free data saved locally on device.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
