import React from 'react';

export const AboutScreenView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center px-6 pb-28 pt-24 max-w-md mx-auto w-full overflow-y-auto relative transition-all duration-200 ease-in-out">
      {/* Same wallpaper backdrop as Home — glass needs something to refract. */}
      <div className="home-bg" aria-hidden="true" />
      <div className="home-overlay" aria-hidden="true" />
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Hero: real app launcher icon + name + version */}
      <div className="flex flex-col items-center text-center z-10 animate-fade-in">
        <img
          src="/images/app-icon.png"
          alt="Momentum app icon"
          className="h-16 w-16 rounded-[18px] shadow-xl transition-all duration-200 ease-in-out hover:scale-105"
          loading="lazy"
        />
        <div className="mt-4 flex items-center gap-2">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
            Momentum
          </h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-lg backdrop-blur-md">
            PRO
          </span>
        </div>
        <p className="mt-1 text-sm font-medium tracking-wide text-zinc-300 drop-shadow-sm">
          Clean Habit Tracker
        </p>
        <span className="mt-3 rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] font-bold text-zinc-400 shadow-md backdrop-blur-sm">
          v1.0.0
        </span>
      </div>

      {/* Philosophy */}
      <div className="mt-8 flex max-w-xs flex-col items-center text-center z-10 animate-fade-in">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 drop-shadow-sm">
          Philosophy
        </div>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-zinc-100 drop-shadow-md">
          Consistency is the key to mastery. Build daily habits with a
          distraction-free experience.
        </p>
      </div>

      {/* How it works */}
      <div className="mt-8 flex w-full max-w-xs flex-col z-10 animate-fade-in">
        <div className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 drop-shadow-sm">
          How it works
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {[
            { n: '1', title: 'Create a habit', desc: 'Tap + below, name it, pick a colour and icon.' },
            { n: '2', title: 'Build your streak', desc: 'The counter runs in 24-hour cycles from your start.' },
            { n: '3', title: 'Mark your days', desc: 'In Stats, Done extends the run and Skip pauses it.' },
            { n: '4', title: 'Reach your goal', desc: 'The ring fills toward your target days. Reset anytime to restart.' },
          ].map((step) => (
            <div key={step.n} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white shadow-lg backdrop-blur-md">
                {step.n}
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-bold leading-tight text-white drop-shadow-sm">
                  {step.title}
                </span>
                <span className="block text-xs font-normal leading-relaxed text-zinc-300">
                  {step.desc}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
