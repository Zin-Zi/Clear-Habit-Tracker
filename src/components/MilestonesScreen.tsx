import React from 'react';
import { Award, Lock, CheckCircle2, Sparkles, Trophy, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Milestone } from '../types/habit';
import { DEFAULT_MILESTONES } from '../services/storage';

interface MilestonesScreenProps {
  currentStreakDays: number;
}

export const MilestonesScreen: React.FC<MilestonesScreenProps> = ({ currentStreakDays }) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Reboot Milestones</h2>
          <p className="text-xs text-slate-400">Unlock neurochemical restoration ranks as you progress.</p>
        </div>
        <button
          onClick={triggerConfetti}
          aria-label="Celebrate milestones"
          className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Badges */}
      <div className="space-y-3">
        {DEFAULT_MILESTONES.map((milestone) => {
          const isUnlocked = currentStreakDays >= milestone.days;
          const daysRemaining = Math.max(0, milestone.days - currentStreakDays);

          return (
            <div
              key={milestone.days}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                isUnlocked
                  ? 'bg-slate-900 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-70'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                  isUnlocked ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800 border border-slate-700 grayscale'
                }`}
              >
                {milestone.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                    {milestone.title}
                  </h3>
                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3" /> in {daysRemaining}d
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
