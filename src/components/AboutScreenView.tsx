import React from 'react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto w-full text-center space-y-5 bg-[#F5F5F5] text-gray-900 select-none">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center text-4xl">
        🛡️
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">NoFap Counter</h2>
        <p className="text-xs font-semibold text-teal-600">Material 3 • Modern Clean Light Theme</p>
        <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-mono text-gray-500 shadow-2xs mt-1">
          Version 1.0.0
        </span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-xs text-gray-600 space-y-2.5 text-left w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">
          Privacy & Offline Storage
        </div>
        <p className="leading-relaxed">
          100% offline, privacy-first habit counter. All habit records, streaks, and timestamps are stored locally on your device with Room & DataStore. No external networking, zero ads.
        </p>
      </div>
    </div>
  );
};
