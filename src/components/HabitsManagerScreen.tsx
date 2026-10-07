import React, { useState } from 'react';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { motion } from 'framer-motion';
import { Habit } from '../types/habit';

interface HabitsManagerScreenProps {
  habits: Habit[];
  activeHabitId: string;
  onSelectHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onUpdateHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onReorderHabits: (habits: Habit[]) => void;
  onBack: () => void;
}

const COLOR_OPTIONS = [
  '#00897B', // Soft Teal
  '#10B981', // Emerald Green
  '#2563EB', // Royal Blue
  '#0284C7', // Sky Blue
  '#6366F1', // Indigo
  '#7C3AED', // Deep Violet
  '#EC4899', // Pink
  '#E11D48', // Rose
  '#F97316', // Bright Orange
  '#D97706', // Warm Amber
  '#84CC16', // Lime Green
  '#64748B', // Slate Gray
];

const EMOJI_OPTIONS = [
  '⚡', '🚿', '🧘', '📵', '🏋️', '🌱',
  '📚', '💧', '🏃', '🚴', '🍏', '🛌',
  '💻', '🎨', '🎯', '☀️', '🧠', '🔥',
];

const toLocalISOString = (isoString?: string) => {
  const date = isoString ? new Date(isoString) : new Date();
  if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 16);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().slice(0, 16);
};

export const HabitsManagerScreen: React.FC<HabitsManagerScreenProps> = ({
  habits,
  activeHabitId,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
  onBack,
}) => {
  const existingHabit = habits.find((h) => h.id === activeHabitId);
  const isEditing = Boolean(existingHabit);

  const [name, setName] = useState(existingHabit?.name || '');
  const [startDateTime, setStartDateTime] = useState(
    toLocalISOString(existingHabit?.startDate)
  );
  const [selectedColor, setSelectedColor] = useState(existingHabit?.color || COLOR_OPTIONS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(existingHabit?.icon || EMOJI_OPTIONS[0]);
  const [nameError, setNameError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    try {
      Haptics.notification({ type: NotificationType.Success });
    } catch {}

    if (isEditing && existingHabit) {
      onUpdateHabit({
        ...existingHabit,
        name: name.trim(),
        icon: selectedEmoji,
        color: selectedColor,
        startDate: new Date(startDateTime).toISOString(),
      });
    } else {
      onAddHabit({
        name: name.trim(),
        description: '',
        icon: selectedEmoji,
        color: selectedColor,
        startDate: new Date(startDateTime).toISOString(),
        bestStreakDays: 0,
        targetDays: 90,
        order: habits.length,
      });
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F2F4F7] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 overflow-y-auto transition-colors duration-200">
      {/* Full-Screen Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-screen p-5 space-y-6"
      >
        {/* Full-Screen Top Navigation Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
              {isEditing ? 'Edit Habit' : 'Create Habit'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {isEditing ? 'Update habit details and streak start time.' : 'Set up a new habit to build momentum.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200/60 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-5">
          {/* 1. Habit Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Meditation, Reading"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              className={`w-full bg-gray-50 dark:bg-slate-800 border rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all shadow-xs ${
                nameError
                  ? 'border-red-500'
                  : 'border-gray-200 dark:border-slate-700 focus:border-[#00897B] dark:focus:border-teal-400'
              }`}
            />
          </div>

          {/* 2. Streak Start Date & Time */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              max={toLocalISOString()}
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#00897B] dark:focus:border-teal-400 cursor-pointer transition-all shadow-xs"
            />
          </div>

          {/* 3. Accent Color Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Color Theme
            </label>
            <div className="grid grid-cols-6 gap-3 px-1">
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 rounded-full justify-self-center transition-all ${
                    selectedColor === color
                      ? 'ring-3 ring-[#00897B] dark:ring-teal-400 ring-offset-2 ring-offset-[#F2F4F7] dark:ring-offset-[#0F172A] scale-110 shadow-md'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 4. Habit Icon Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2.5 max-h-48 overflow-y-auto px-1 py-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center justify-self-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-[#00897B]/15 dark:bg-teal-950/60 border-2 border-[#00897B] dark:border-teal-400 scale-105 shadow-xs'
                      : 'bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#00897B] hover:bg-[#00796B] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-md transition-colors"
            >
              Save Habit
            </motion.button>

            {isEditing && existingHabit && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="w-full h-12 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center shadow-xs transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Delete Habit
              </motion.button>
            )}

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-center transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && existingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Delete "{existingHabit.name}"?</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Permanently remove this habit and all its history?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteHabit(existingHabit.id);
                  onBack();
                }}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
