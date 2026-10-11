import React from 'react';
import { Home, BarChart3, Plus, Settings, Info } from 'lucide-react';
import { tapLight } from '../services/haptics';
import type { ScreenType } from '../App';

interface BottomNavProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onAdd: () => void;
}

const NavButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}> = ({ label, active, onPress, children }) => (
  <button
    type="button"
    onClick={onPress}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className={`flex w-14 shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-fixed-white transition-all duration-200 ease-in-out hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
      active
        ? 'bg-white/15 opacity-100 shadow-lg'
        : 'opacity-50 hover:bg-white/5 hover:opacity-90'
    }`}
  >
    {children}
    <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

/* Bottom glass navigation: Home · Stats · + · Settings · About.
   Borderless floating bar; the center + is a raised solid FAB.
   Memoized: only activeScreen changes re-render it. */
export const BottomNav: React.FC<BottomNavProps> = React.memo(({ activeScreen, onNavigate, onAdd }) => {
  const go = (screen: ScreenType) => {
    try {
      tapLight();
    } catch {}
    onNavigate(screen);
  };

  return (
    <nav aria-label="Main navigation" className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-4 pt-1">
      <div className="pointer-events-auto mx-auto flex max-w-[340px] items-end justify-between rounded-full bg-white/10 px-2 py-2 shadow-2xl backdrop-blur-xl">
        <NavButton label="Home" active={activeScreen === 'home'} onPress={() => go('home')}>
          <Home className="h-5 w-5" strokeWidth={2.5} />
        </NavButton>
        <NavButton label="Stats" active={activeScreen === 'stats'} onPress={() => go('stats')}>
          <BarChart3 className="h-5 w-5" strokeWidth={2.5} />
        </NavButton>
        <button
          type="button"
          onClick={() => {
            try {
              tapLight();
            } catch {}
            onAdd();
          }}
          aria-label="Add new habit"
          className="-mt-7 flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-950 shadow-xl shadow-white/25 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-zinc-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Plus className="h-6 w-6" strokeWidth={2.75} />
        </button>
        <NavButton label="Settings" active={activeScreen === 'settings'} onPress={() => go('settings')}>
          <Settings className="h-5 w-5" strokeWidth={2.5} />
        </NavButton>
        <NavButton label="About" active={activeScreen === 'about'} onPress={() => go('about')}>
          <Info className="h-5 w-5" strokeWidth={2.5} />
        </NavButton>
      </div>
    </nav>
  );
});
