import React, { useState } from 'react';
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

const SIX_COLORS = [
  '#0D9488', // Teal
  '#2563EB', // Blue
  '#0284C7', // Sky
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#E11D48', // Rose
];

const SIX_EMOJIS = ['🛡️', '🚿', '🧘', '📵', '🏋️', '⚡'];

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
  const [startDate, setStartDate] = useState(
    existingHabit?.startDate
      ? new Date(existingHabit.startDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [selectedColor, setSelectedColor] = useState(existingHabit?.color || SIX_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(existingHabit?.icon || SIX_EMOJIS[0]);
  const [nameError, setNameError] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    if (isEditing && existingHabit) {
      onUpdateHabit({
        ...existingHabit,
        name: name.trim(),
        icon: selectedEmoji,
        color: selectedColor,
        startDate: new Date(startDate).toISOString(),
      });
    } else {
      onAddHabit({
        name: name.trim(),
        description: '',
        icon: selectedEmoji,
        color: selectedColor,
        startDate: new Date(startDate).toISOString(),
        bestStreakDays: 0,
        targetDays: 90,
        order: habits.length,
      });
    }
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full bg-[#F5F5F5] text-gray-900 overflow-y-auto">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 space-y-4">
          {/* 1. Name Field (OutlinedTextField, required) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., No Sugar, Reading, Workout"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none transition-colors ${
                nameError ? 'border-red-500' : 'border-gray-200 focus:border-teal-600'
              }`}
            />
          </div>

          {/* 2. Start Date (Single button/picker) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer transition-colors"
            />
          </div>

          {/* 3. Color (Row of 6 small color circles) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Accent Color
            </label>
            <div className="flex items-center justify-between px-1">
              {SIX_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-gray-900 ring-offset-2 ring-offset-white scale-110 shadow-sm' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 4. Icon (Row of 6 emojis) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Habit Icon
            </label>
            <div className="flex items-center justify-between px-1">
              {SIX_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-teal-50 border-2 border-teal-600 scale-105 shadow-sm'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Buttons at Bottom (Save & Delete full-width) */}
        <div className="pt-2 space-y-2.5">
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-md transition-all active:scale-95"
          >
            Save Habit
          </button>

          {isEditing && existingHabit && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${existingHabit.name}"?`)) {
                  onDeleteHabit(existingHabit.id);
                  onBack();
                }
              }}
              className="w-full h-12 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center shadow-sm transition-all active:scale-95"
            >
              Delete Habit
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 text-center"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
