import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Wind, 
  Eye, 
  Dumbbell, 
  Droplet, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UrgeEmergencyScreenProps {
  onBackToCounter: () => void;
}

export const UrgeEmergencyScreen: React.FC<UrgeEmergencyScreenProps> = ({
  onBackToCounter,
}) => {
  const [activeTab, setActiveTab] = useState<'wave' | 'breathing' | 'grounding' | 'physical'>('wave');

  // Wave timer state (15 minutes countdown)
  const [waveSecondsLeft, setWaveSecondsLeft] = useState(15 * 60);
  const [isWaveRunning, setIsWaveRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isWaveRunning && waveSecondsLeft > 0) {
      interval = setInterval(() => {
        setWaveSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (waveSecondsLeft === 0 && isWaveRunning) {
      setIsWaveRunning(false);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
    return () => clearInterval(interval);
  }, [isWaveRunning, waveSecondsLeft]);

  // Breathing state (4-4-4-4 Box Breathing)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  useEffect(() => {
    if (!isBreathingActive) return;
    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Pause';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Grounding checkboxes
  const [groundingChecks, setGroundingChecks] = useState<{ [key: string]: boolean }>({});

  const toggleGrounding = (id: string) => {
    setGroundingChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pushup counter
  const [pushupsDone, setPushupsDone] = useState(0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full space-y-4 pb-16">
      {/* Top Banner */}
      <div className="bg-red-950/40 border border-red-800/60 rounded-3xl p-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
          <Flame className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Urge Surfing & Emergency Tool</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">An Urge Is Just A Chemical Wave</h2>
        <p className="text-xs text-slate-300 mt-1">
          Dopamine cravings peak at 10–15 minutes. If you refuse to feed them with mental attention or physical proximity, the neurochemical storm collapses.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('wave')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'wave' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          15m Timer
        </button>
        <button
          onClick={() => setActiveTab('breathing')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'breathing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Breathing
        </button>
        <button
          onClick={() => setActiveTab('grounding')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'grounding' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          5-4-3-2-1
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'physical' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Shock Body
        </button>
      </div>

      {/* Tab 1: 15-Minute Wave Timer */}
      {activeTab === 'wave' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Urge Wave Peak Countdown
          </div>
          <div className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
            {formatTime(waveSecondsLeft)}
          </div>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Sit or walk calmly. Observe the physical sensation in your body without judgment. Do not fight it; watch it peak and dissipate.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsWaveRunning(!isWaveRunning)}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              {isWaveRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isWaveRunning ? 'Pause Wave' : 'Ride the 15m Wave'}</span>
            </button>
            <button
              onClick={() => {
                setIsWaveRunning(false);
                setWaveSecondsLeft(15 * 60);
              }}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white active:scale-95"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Box Breathing (4-4-4-4) */}
      {activeTab === 'breathing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Box Breathing (Vagus Nerve Reset)
          </div>

          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-4 border-blue-500/40 transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'scale-110 bg-blue-500/20'
                  : breathPhase === 'Hold'
                  ? 'scale-110 bg-blue-600/30'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 bg-blue-500/10'
                  : 'scale-90 bg-slate-900'
              }`}
            />
            <div className="relative z-10">
              <div className="text-2xl font-black text-white tracking-tight">{breathPhase}</div>
              <div className="text-4xl font-mono font-bold text-blue-300 mt-1">{breathCount}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400">
            <div className={breathPhase === 'Inhale' ? 'text-blue-400 scale-105 transition-transform' : ''}>1. Inhale (4s)</div>
            <div className={breathPhase === 'Hold' ? 'text-blue-400 scale-105 transition-transform' : ''}>2. Hold (4s)</div>
            <div className={breathPhase === 'Exhale' ? 'text-blue-400 scale-105 transition-transform' : ''}>3. Exhale (4s)</div>
            <div className={breathPhase === 'Pause' ? 'text-blue-400 scale-105 transition-transform' : ''}>4. Pause (4s)</div>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className="px-5 py-2.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 transition-colors"
          >
            {isBreathingActive ? 'Pause Breathing Exercise' : 'Resume Breathing Guide'}
          </button>
        </div>
      )}

      {/* Tab 3: 5-4-3-2-1 Sensory Grounding */}
      {activeTab === 'grounding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">5-4-3-2-1 Sensory Grounding</h3>
            <p className="text-xs text-slate-300 mt-0.5">Engage your physical senses to pull blood flow back to your prefrontal cortex.</p>
          </div>

          <div className="space-y-2">
            {[
              { id: 'see', count: 5, label: 'Look around and name 5 things you can SEE.' },
              { id: 'touch', count: 4, label: 'Touch 4 distinct textures (clothes, chair, desk, hair).' },
              { id: 'hear', count: 3, label: 'Close your eyes and listen for 3 distinct SOUNDS.' },
              { id: 'smell', count: 2, label: 'Notice 2 things you can SMELL in the air.' },
              { id: 'taste', count: 1, label: 'Focus on 1 TASTE in your mouth or drink water.' },
            ].map((step) => {
              const isChecked = !!groundingChecks[step.id];
              return (
                <button
                  key={step.id}
                  onClick={() => toggleGrounding(step.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center">
                      {step.count}
                    </span>
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                  {isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Physical Disruption */}
      {activeTab === 'physical' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Physical Disruption Tools</h3>
            <p className="text-xs text-slate-300 mt-0.5">Use physical stimuli to snap dopamine receptors into sympathetic balance.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Droplet className="w-8 h-8 text-cyan-400 mx-auto" />
              <div className="text-xs font-bold text-slate-200">Ice-Cold Splash</div>
              <p className="text-[11px] text-slate-400">Splash freezing water on your face for 30s (mammalian dive reflex).</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="text-xs font-bold text-slate-200">20 Quick Pushups</div>
              <p className="text-[11px] text-slate-400">Burns off physical adrenaline immediately.</p>
              <button
                onClick={() => setPushupsDone((p) => p + 5)}
                className="mt-1 w-full py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30"
              >
                +5 Done ({pushupsDone})
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span><strong>Golden Rule:</strong> Change your room / physical location right now! Do not stay in bed or behind a closed door.</span>
          </div>
        </div>
      )}

      {/* Return to Dashboard */}
      <button
        onClick={onBackToCounter}
        className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs active:scale-95 transition-all text-center border border-slate-700"
      >
        Return to Counter Dashboard
      </button>
    </div>
  );
};
