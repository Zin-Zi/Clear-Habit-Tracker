import React, { useState } from 'react';
import { notifySuccess } from '../services/haptics';
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
  '#2DD4BF', // Bright Teal
  '#34D399', // Bright Emerald
  '#3B82F6', // Bright Blue
  '#38BDF8', // Bright Sky
  '#818CF1', // Bright Indigo
  '#A78BFA', // Bright Violet
  '#F472B6', // Bright Pink
  '#FB7185', // Bright Rose
  '#FB923C', // Bright Orange
  '#FBBF24', // Bright Amber
  '#A3E635', // Bright Lime
  '#94A3B8', // Bright Slate
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
      notifySuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xl text-white overflow-hidden transition-all duration-200 ease-in-out">
      {/* One big glass FAB card holding the whole form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-md rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-4 space-y-3 max-h-[94dvh] overflow-y-auto"
      >
        {/* Compact Top Navigation Bar: title … Cancel + Save on top */}
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="px-1 min-w-0 flex-1">
            <h2 className="premium-title text-base font-extrabold tracking-wide text-white drop-shadow-md leading-relaxed transition-all duration-200 ease-in-out truncate">
              {isEditing ? 'Edit Habit' : 'Create Habit'}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              form="habit-form"
              className="h-8 px-3.5 rounded-full bg-white text-zinc-950 font-extrabold tracking-wide text-[13px] drop-shadow-md flex items-center justify-center shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:bg-zinc-200 active:scale-95 transition-all duration-200 ease-in-out"
            >
              Save
            </motion.button>
            <button
              type="button"
              onClick={onBack}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md text-gray-100 shadow-xl cursor-pointer hover:scale-110 hover:-translate-y-1 hover:bg-white/20 active:scale-95 transition-all duration-200 ease-in-out"
            >
              ✕
            </button>
          </div>
        </div>

        <form id="habit-form" onSubmit={handleSave} className="space-y-3 min-h-0">
          <div className="space-y-4">
          {/* 1. Habit Name */}
          <div className="px-1">
            <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1 drop-shadow-sm transition-all duration-200 ease-in-out">
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
              className={`w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-full shadow-xl px-4 py-1.5 text-[13px] font-medium leading-relaxed text-white placeholder:text-gray-400 placeholder:font-normal focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-text transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                nameError
                  ? 'ring-2 ring-red-500'
                  : ''
              }`}
            />
          </div>

          {/* 2. Streak Start Date & Time */}
          <div className="px-1">
            <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1 drop-shadow-sm transition-all duration-200 ease-in-out">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              max={toLocalISOString()}
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-full shadow-xl px-4 py-1.5 text-[13px] font-medium leading-relaxed text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 [color-scheme:dark]"
            />
          </div>

          {/* 3. Accent Color Grid */}
          <div className="px-1">
            <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1 drop-shadow-sm transition-all duration-200 ease-in-out">
              Color Theme
            </label>
            <div className="grid grid-cols-6 gap-2 px-1">
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                  className={`w-8 h-8 rounded-full justify-self-center backdrop-blur-md shadow-xl cursor-pointer hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-200 ease-in-out ${
                    selectedColor === color
                      ? 'ring-2 ring-white scale-110 shadow-xl'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 4. Habit Icon Grid */}
          <div className="px-1">
            <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1 drop-shadow-sm transition-all duration-200 ease-in-out">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 px-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-full text-xs flex items-center justify-center justify-self-center backdrop-blur-md shadow-xl cursor-pointer hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-200 ease-in-out ${
                    selectedEmoji === emoji
                      ? 'bg-gradient-to-br from-white/20 to-white/10 text-white scale-105 shadow-xl ring-2 ring-white'
                      : 'bg-white/10 text-gray-100 hover:bg-white/15'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          </div>

          {/* Destructive action stays pinned at the bottom */}
          <div className="pt-1 space-y-2">
            {isEditing && existingHabit && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="w-full h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg text-zinc-100 font-bold tracking-wide drop-shadow-md flex items-center justify-center shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/15 active:scale-95 transition-all duration-200 ease-in-out"
              >
                Delete Habit
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && existingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in">
          <div className="bg-gray-900/25 backdrop-blur-xl rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl animate-fade-in">
            <h3 className="text-base font-extrabold tracking-wide text-white drop-shadow-md leading-relaxed">Delete "{existingHabit.name}"?</h3>
            <p className="text-sm font-normal text-gray-200 leading-relaxed drop-shadow-sm px-1 transition-all duration-200 ease-in-out">
              Permanently remove this habit and all its history?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md font-semibold text-gray-200 shadow-xl cursor-pointer hover:scale-105 hover:-translate-y-1 hover:bg-white/20 hover:text-white active:scale-95 transition-all duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteHabit(existingHabit.id);
                  onBack();
                }}
                className="px-4 py-2 text-xs font-bold tracking-wide text-white drop-shadow-md rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-1 active:scale-95 transition-all duration-200 ease-in-out"
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
