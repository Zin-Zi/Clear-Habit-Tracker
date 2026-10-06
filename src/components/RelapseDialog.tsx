import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';
import { Habit, RelapseLog } from '../types/habit';

interface RelapseDialogProps {
  habit: Habit;
  currentStreakDays: number;
  onClose: () => void;
  onConfirmReset: (log: Omit<RelapseLog, 'id' | 'timestamp'>) => void;
}

const COMMON_TRIGGERS = [
  '📱 Late Night Phone in Bed',
  '🥱 Boredom & Inactivity',
  '😫 Work or School Stress',
  '👀 Peeking / Social Media NSFW',
  '😔 Loneliness / Sadness',
  '🍺 Alcohol / Substances',
  '😴 Fatigue / Poor Sleep',
  '⚡ High Urge Spike',
];

const MOODS = ['Frustrated', 'Tired', 'Anxious', 'Disappointed', 'Determined', 'Accepting'];

export const RelapseDialog: React.FC<RelapseDialogProps> = ({
  habit,
  currentStreakDays,
  onClose,
  onConfirmReset,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState(COMMON_TRIGGERS[0]);
  const [selectedMood, setSelectedMood] = useState('Determined');
  const [notes, setNotes] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset({
      habitId: habit.id,
      habitName: habit.name,
      streakDaysAtRelapse: currentStreakDays,
      trigger: selectedTrigger,
      mood: selectedMood,
      notes: notes.trim() || 'No additional notes',
      lessonLearned: lessonLearned.trim() || 'Focus on immediate physical environment change.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <RefreshCw className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">Reset Streak & Reflect</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compassionate message banner */}
        <div className="my-3 p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-blue-300 block font-semibold mb-0.5">Recovery is a progression, not perfection.</strong>
            A relapse does NOT erase the neural rewiring and discipline you built during your <strong>{currentStreakDays} days</strong> streak. Learn the trigger and reset with dignity!
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {/* Trigger Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Primary Trigger
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {COMMON_TRIGGERS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedTrigger(t)}
                  className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all ${
                    selectedTrigger === t
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Current Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedMood === m
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              What happened? (Brief Note)
            </label>
            <input
              type="text"
              placeholder="e.g. Scrolled in bed past midnight, felt lonely"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Lesson Learned */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              What is my barrier/defense for next time?
            </label>
            <input
              type="text"
              placeholder="e.g. Charge phone in kitchen; 20 pushups when urge hits"
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Cancel (False Alarm)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset & Restart Day 1</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
