import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  Target, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Share2,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit } from '../types/habit';
import { DEFAULT_MILESTONES } from '../services/storage';

interface MainCounterScreenProps {
  habit: Habit;
  onOpenEmergency: () => void;
  onOpenRelapseDialog: () => void;
  onOpenMilestones: () => void;
  onOpenHabitSettings: () => void;
}

export const MainCounterScreen: React.FC<MainCounterScreenProps> = ({
  habit,
  onOpenEmergency,
  onOpenRelapseDialog,
  onOpenMilestones,
}) => {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(habit.startDate).getTime();
      const now = Date.now();
      const diffMillis = Math.max(0, now - start);

      const totalSeconds = Math.floor(diffMillis / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setElapsed({ days, hours, minutes, seconds, totalSeconds });
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(timer);
  }, [habit.startDate]);

  const targetDays = habit.targetDays || 90;
  const progressPercent = Math.min(100, Math.max(0, (elapsed.days / targetDays) * 100));

  const currentMilestone = [...DEFAULT_MILESTONES]
    .reverse()
    .find((m) => elapsed.days >= m.days) || DEFAULT_MILESTONES[0];

  const nextMilestone = DEFAULT_MILESTONES.find((m) => m.days > elapsed.days) || DEFAULT_MILESTONES[DEFAULT_MILESTONES.length - 1];
  const daysToNextMilestone = Math.max(0, nextMilestone.days - elapsed.days);

  const handleDailyCheckIn = () => {
    setCheckedInToday(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
    });
    setTimeout(() => setCheckedInToday(false), 3000);
  };

  const handleShareStreak = () => {
    const shareText = `🛡️ I have been clean on "${habit.name}" for ${elapsed.days} days! Building mental clarity & discipline with NoFap Day Counter.`;
    if (navigator.share) {
      navigator.share({
        title: 'My Recovery Streak',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full space-y-4 pb-12">
      {/* Toast */}
      {showShareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          Streak copied to clipboard! 📋
        </div>
      )}

      {/* Motivational Pledge Card */}
      {habit.pledge && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="text-blue-400 font-serif text-2xl leading-none select-none">“</span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium italic leading-relaxed">
              {habit.pledge}
            </p>
          </div>
        </div>
      )}

      {/* Hero Counter Card */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 text-center border shadow-xl transition-all"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <span className="text-base">{habit.icon || '🛡️'}</span>
            <span>{habit.name}</span>
          </div>

          <button
            onClick={handleShareStreak}
            aria-label="Share current streak"
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Large Day Number */}
        <div className="my-3">
          <div className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-blue-200 drop-shadow-md">
            {elapsed.days}
          </div>
          <div className="text-sm font-extrabold tracking-widest uppercase text-blue-400 mt-1">
            {elapsed.days === 1 ? 'DAY CLEAN & FREE' : 'DAYS CLEAN & FREE'}
          </div>
        </div>

        {/* Live Ticking Segments */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto my-4">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl py-2 px-1">
            <span className="text-xl font-mono font-bold text-slate-100">
              {String(elapsed.hours).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">Hours</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl py-2 px-1">
            <span className="text-xl font-mono font-bold text-slate-100">
              {String(elapsed.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">Mins</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl py-2 px-1">
            <span className="text-xl font-mono font-bold text-emerald-400">
              {String(elapsed.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">Secs</span>
          </div>
        </div>

        {/* Target Goal Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Target Goal: {targetDays} Days
            </span>
            <span className="text-blue-400 font-mono">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
            <span>Started: {new Date(habit.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span>{Math.max(0, targetDays - elapsed.days)} days remaining</span>
          </div>
        </div>
      </div>

      {/* Streak Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Personal Best</div>
            <div className="text-lg font-black text-slate-100">
              {Math.max(habit.bestStreakDays, elapsed.days)} <span className="text-xs font-medium text-slate-400">days</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenMilestones}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all rounded-2xl p-3.5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl shrink-0">
            {currentMilestone.icon}
          </div>
          <div className="truncate">
            <div className="text-[11px] font-semibold text-purple-400 uppercase">Rank Badge</div>
            <div className="text-xs font-bold text-slate-100 truncate">
              {currentMilestone.title.split(':')[0]}
            </div>
          </div>
        </button>
      </div>

      {/* Next Milestone */}
      {daysToNextMilestone > 0 && (
        <div 
          onClick={onOpenMilestones}
          className="cursor-pointer bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{nextMilestone.icon}</span>
            <div>
              <span className="font-semibold text-slate-200">Next: {nextMilestone.title}</span>
              <p className="text-[11px] text-slate-400 leading-tight">{nextMilestone.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0 font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
            +{daysToNextMilestone}d
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* 1. Emergency Urge Surfer Button */}
        <button
          onClick={onOpenEmergency}
          aria-label="Activate Emergency Urge Surfer"
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-400/30"
        >
          <Flame className="w-6 h-6 animate-bounce" />
          <span>EMERGENCY URGE SURFER</span>
        </button>

        {/* 2. Daily Check-in Button */}
        <button
          onClick={handleDailyCheckIn}
          aria-label="Pledge Daily Check-in"
          className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] ${
            checkedInToday
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-700'
          }`}
        >
          {checkedInToday ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Checked In For Today! Proud of you!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Pledge Today Clean (+1 Check-in)</span>
            </>
          )}
        </button>

        {/* 3. Secondary Reset / Relapse Button */}
        <button
          onClick={onOpenRelapseDialog}
          aria-label="Open Relapse Reflection and Reset"
          className="w-full py-3 px-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Log Relapse & Streak Reset</span>
        </button>
      </div>
    </div>
  );
};
