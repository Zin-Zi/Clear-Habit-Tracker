import React, { useState } from 'react';
import { AppSettings } from '../types/habit';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDataReload: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onDataReload,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isDarkMode = settings.darkMode ?? false;
  const isReminderEnabled = settings.reminderEnabled ?? false;
  const reminderTime = settings.reminderTime || '20:00';

  // Format 24h time string like "20:00" to readable "8:00 PM"
  const formatDisplayTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const handleToggleDarkMode = () => {
    onUpdateSettings({
      ...settings,
      darkMode: !isDarkMode,
    });
  };

  const handleToggleReminder = () => {
    onUpdateSettings({
      ...settings,
      reminderEnabled: !isReminderEnabled,
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onUpdateSettings({
      ...settings,
      reminderTime: newTime,
    });
  };

  const handleResetAllData = () => {
    StorageService.clearAllData();
    onDataReload();
    setShowConfirmReset(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] text-gray-900 select-none overflow-hidden p-4">
      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 divide-y divide-gray-100">
        {/* 1. Dark mode (Switch) */}
        <div className="flex items-center justify-between px-4 py-4 min-h-[56px]">
          <span className="text-base font-medium text-gray-800">Dark mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            onClick={handleToggleDarkMode}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
              isDarkMode ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Daily reminder (Switch) */}
        <div className="flex items-center justify-between px-4 py-4 min-h-[56px]">
          <span className="text-base font-medium text-gray-800">Daily reminder</span>
          <button
            type="button"
            role="switch"
            aria-checked={isReminderEnabled}
            onClick={handleToggleReminder}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
              isReminderEnabled ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${
                isReminderEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Reminder time (button, opens time picker — shown only when reminder is ON) */}
        {isReminderEnabled && (
          <div className="flex items-center justify-between px-4 py-4 min-h-[56px]">
            <span className="text-base font-medium text-gray-800">Reminder time</span>
            <div className="relative">
              <input
                type="time"
                value={reminderTime}
                onChange={handleTimeChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                id="time-picker-input"
              />
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-teal-600 hover:bg-gray-100 transition-colors shadow-2xs"
              >
                {formatDisplayTime(reminderTime)}
              </button>
            </div>
          </div>
        )}

        {/* 4. Reset all data (red text button, confirmation dialog) */}
        <div className="px-4 py-4 min-h-[56px] flex items-center">
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="text-base font-medium text-red-600 hover:text-red-700 text-left py-1"
          >
            Reset all data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Reset all data?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This will permanently delete all habits, streak counters, and relapse history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
