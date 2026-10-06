import React from 'react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto w-full text-center space-y-5 bg-[#F5F5F5] dark:bg-slate-950 text-gray-900 dark:text-slate-100 select-none transition-colors duration-200">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 flex items-center justify-center text-4xl transition-colors duration-200">
        🛡️
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">NoFap Counter</h2>
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">Material 3 • Clean & Privacy-Focused</p>
        <span className="inline-block px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-[10px] font-mono text-gray-500 dark:text-slate-400 shadow-2xs mt-1 transition-colors duration-200">
          Version 1.0.0
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-xs text-gray-600 dark:text-slate-300 space-y-2.5 text-left w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none transition-colors duration-200">
        <div className="font-bold text-gray-900 dark:text-slate-100 uppercase text-[10px] tracking-wider">
          Privacy & Offline Storage
        </div>
        <p className="leading-relaxed">
          100% offline, privacy-first habit counter. All habit records, streaks, and timestamps are stored locally on your device with Room & DataStore. No external networking, zero ads.
        </p>
      </div>
    </div>
  );
};
