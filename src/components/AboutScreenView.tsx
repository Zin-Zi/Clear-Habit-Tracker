import React from 'react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full space-y-4 bg-[#F5F5F5] dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-y-auto transition-colors duration-200">
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
        About Clear Habit Tracker
      </h2>
      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
        Clear Habit Tracker helps you build positive daily habits, break unwanted behaviors, and stay consistent over time.
      </p>
      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
        Key Benefits:
      </p>
      <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
        <li>Real-Time Streak Tracking: Easily track your progress day by day to stay motivated.</li>
        <li>Custom Start Dates & Times: Edit the exact start date and time of your streaks whenever needed.</li>
        <li>Custom Daily Reminders: Set personalized daily reminder notifications to maintain discipline.</li>
        <li>100% Local & Private: All your habit records stay securely on your device with complete offline privacy.</li>
      </ul>
    </div>
  );
};
