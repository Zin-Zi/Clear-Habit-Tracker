import React from 'react';
import { Zap, CheckCircle2, Shield } from 'lucide-react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-5 max-w-md mx-auto w-full space-y-4 bg-[#F2F4F7] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 overflow-y-auto relative transition-colors duration-200">
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-0 w-72 h-72 bg-[#00897B]/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Badge Card */}
      <div className="glass-card rounded-2xl p-5 shadow-xl border border-white/60 dark:border-slate-800/80 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00897B] to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 tracking-tight">
                Momentum
              </h2>
              <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-[#00897B] to-emerald-500 text-white">
                PRO
              </span>
            </div>
            <p className="text-xs font-semibold text-[#00897B] dark:text-teal-400">
              Clean Habit Tracker
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-gray-100/80 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60 rounded-full text-[11px] font-mono font-bold text-gray-600 dark:text-slate-300">
          v1.0.0
        </span>
      </div>

      {/* Philosophy Card */}
      <div className="glass-card rounded-2xl p-5 shadow-xl border border-white/60 dark:border-slate-800/80 space-y-1.5 z-10 relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          Philosophy
        </h3>
        <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed font-medium">
          Consistency is the key to mastery. Momentum helps you build daily habits with a distraction-free experience.
        </p>
      </div>

      {/* 3 Practical Benefits Cards */}
      <div className="space-y-2.5 z-10 relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 px-1">
          Key Benefits
        </h3>

        <div className="glass-card rounded-2xl p-4 shadow-lg border border-white/60 dark:border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#00897B] dark:text-teal-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">Build Discipline</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Build daily consistency day by day.</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-lg border border-white/60 dark:border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">Accurate Streak Tracking</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Track 24-hour cycles with live elapsed timers.</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-lg border border-white/60 dark:border-slate-800/80 flex items-center gap-3.5">
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
