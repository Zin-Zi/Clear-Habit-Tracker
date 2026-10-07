import React from 'react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full space-y-5 bg-[#F5F5F5] dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-y-auto transition-colors duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          Momentum v1.0.0
        </h2>
      </div>

      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
        Consistency is the key to mastery. Momentum helps you build daily habits with a distraction-free experience.
      </p>

      <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
        <li>Build discipline day by day</li>
        <li>Track progress cleanly and accurately</li>
        <li>Minimal and focused distraction-free design</li>
      </ul>
    </div>
  );
};
