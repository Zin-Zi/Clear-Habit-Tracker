import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { StatusBar, Style } from '@capacitor/status-bar';
import { tapLight, setHapticsEnabled } from './services/haptics';
import {
  Habit,
  RelapseLog,
  AppSettings,
  DailyStatus,
  TEXT_COLOR_OPTIONS,
  TRANSPARENCY_ALPHAS,
  normalizeTransparencyLevel,
  BACKGROUND_OPTIONS,
  normalizeBackgroundId,
  DEFAULT_TARGET_DAYS,
  normalizeTargetDays,
  normalizeBgBlur,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  normalizeBrightness,
  normalizeLogo,
} from './types/habit';
import { StorageService } from './services/storage';
import { setDailyStatus, calculateStreak } from './utils/dailyLogs';
import { Wordmark, ensureLogoFont } from './components/Wordmark';
import { FloatingHeader } from './components/FloatingHeader';
import { BottomNav } from './components/BottomNav';
import { HomeScreenView } from './components/HomeScreenView';
import { AboutScreenView } from './components/AboutScreenView';
import { Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initTickerLifecycle, pauseTicker, resumeTicker } from './services/ticker';

// Heavy screens split into their own chunks so the first paint stays small.
// The habit list, header, and nav stay in the main bundle.
const AnalyticsScreen = React.lazy(() =>
  import('./components/AnalyticsScreen').then((m) => ({ default: m.AnalyticsScreen }))
);
const SettingsScreen = React.lazy(() =>
  import('./components/SettingsScreen').then((m) => ({ default: m.SettingsScreen }))
);
const HabitsManagerScreen = React.lazy(() =>
  import('./components/HabitsManagerScreen').then((m) => ({ default: m.HabitsManagerScreen }))
);
const KotlinCodeViewer = React.lazy(() =>
  import('./components/KotlinCodeViewer').then((m) => ({ default: m.KotlinCodeViewer }))
);

export type ScreenType = 'home' | 'stats' | 'settings' | 'about' | 'edit' | 'kotlin_code';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabitId, setActiveHabitId] = useState<string>('');
  const [relapseLogs, setRelapseLogs] = useState<RelapseLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showExitToast, setShowExitToast] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const lastBackPressTimeRef = useRef<number>(0);
  const activeScreenRef = useRef<ScreenType>('home');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Re-check streak/best-day boundaries once a minute while the app is open
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  // Mirror the current screen for listeners registered once (Escape handler).
  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  // Push the appearance settings onto <html> as CSS custom properties.
  // Doing it here (rather than in each component) means a change repaints the
  // whole app instantly without re-rendering anything.
  useEffect(() => {
    const root = document.documentElement;
    const option =
      TEXT_COLOR_OPTIONS.find((c) => c.id === settings.textColor) ?? TEXT_COLOR_OPTIONS[0];
    root.style.setProperty('--app-text-color', option.value);

    const level = normalizeTransparencyLevel(settings.transparencyLevel);
    root.style.setProperty('--glass-alpha', String(TRANSPARENCY_ALPHAS[level] ?? 0.3));

    const bg =
      BACKGROUND_OPTIONS.find((o) => o.id === settings.backgroundId) ?? BACKGROUND_OPTIONS[0];
    root.style.setProperty('--app-bg-image', `url('${bg.file}')`);
    root.style.setProperty('--app-bg-blur', `${normalizeBgBlur(settings.bgBlurPx)}px`);
  }, [settings.textColor, settings.transparencyLevel, settings.backgroundId, settings.bgBlurPx]);

  // Keep the module-level haptic flag in sync with the Settings toggle.
  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled !== false);
  }, [settings.hapticsEnabled]);

  // Preload the logo face so the header never flashes a fallback.
  // useMemo: a fresh object every render would defeat memo'd children.
  const logoSettings = React.useMemo(() => normalizeLogo(settings.logo), [settings.logo]);
  useEffect(() => {
    ensureLogoFont(logoSettings.fontFamily);
  }, [logoSettings.fontFamily]);

  // Start the shared 1s ticker lifecycle (pause on hide/background).
  useEffect(() => {
    initTickerLifecycle();
  }, []);

  // Global tap haptics: every press on an interactive element buzzes once,
  // so no button needs its own haptic call. Capture phase + passive so it
  // never blocks or interferes with the real handler.
  useEffect(() => {
    const onPress = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.('button, a[href], input, select, textarea, summary, [role="button"], [role="switch"], [role="tab"]')) {
        try {
          tapLight();
        } catch {
          // Plugin unavailable — ignore.
        }
      }
    };
    document.addEventListener('pointerdown', onPress, { capture: true, passive: true });
    return () => document.removeEventListener('pointerdown', onPress, { capture: true });
  }, []);

  // The app is permanently dark: keep the `dark` class on <html> and pin the
  // native status bar to the dark palette.
  useEffect(() => {
    document.documentElement.classList.add('dark');

    // Try setting Capacitor native status bar style (Bonus)
    try {
      if (typeof StatusBar !== 'undefined' && StatusBar.setStyle) {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        if (StatusBar.setBackgroundColor) {
          StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
        }
      }
    } catch {
      // Ignored for environments without native plugins
    }
  }, []);

  // Keep the screen awake while the app is in the foreground.
  // Releases on background/unmount so the device can sleep normally.
  useEffect(() => {
    const enable = async () => {
      try {
        await KeepAwake.keepAwake();
      } catch {
        // Plugin unavailable (e.g. web browser) — ignore.
      }
    };
    const disable = async () => {
      try {
        await KeepAwake.allowSleep();
      } catch {
        // Ignored for environments without native plugins.
      }
    };

    enable();
    const stateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        enable();
        resumeTicker();
      } else {
        disable();
        pauseTicker();
      }
    });

    return () => {
      disable();
      stateListener.then((h) => h.remove()).catch(() => {});
    };
  }, []);

  // Hardware Back Button Handler via @capacitor/app
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', () => {
      if (activeScreen !== 'home') {
        // a. Navigate back to Home screen if on another screen
        setActiveScreen('home');
      } else {
        // b & c. Handle double-tap back to exit on Home screen
        const now = Date.now();
        if (now - lastBackPressTimeRef.current < 2000) {
          // Double press within 2s -> exit app
          CapacitorApp.exitApp();
        } else {
          // First press -> record timestamp & show toast
          lastBackPressTimeRef.current = now;
          try {
            tapLight();
          } catch {}
          setShowExitToast(true);

          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }
          // d. Reset toast after 2 seconds
          toastTimeoutRef.current = setTimeout(() => {
            setShowExitToast(false);
          }, 2000);
        }
      }
    });

    // Clean up only our own listener so other App listeners
    // (e.g. appStateChange for KeepAwake) survive screen changes.
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      backButtonListener.then((h) => h.remove()).catch(() => {});
    };
  }, [activeScreen]);

  // Escape mirrors the hardware Back button: returns to the main day counter
  // from any sub-screen (Settings, Stats, About). Wired to `activeScreen` via a
  // ref so the listener is registered once instead of on every navigation.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeScreenRef.current !== 'home') {
        setActiveScreen('home');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Initial load with smooth splash transition
  const loadData = () => {
    const loadedHabits = StorageService.getHabits();
    const loadedLogs = StorageService.getRelapseLogs();
    const loadedSettings = StorageService.getSettings();

    setHabits(loadedHabits);
    setRelapseLogs(loadedLogs);
    setSettings(loadedSettings);

    const initialId = (loadedHabits.some((h) => h.id === loadedSettings.activeHabitId)
      ? loadedSettings.activeHabitId
      : loadedHabits[0]?.id) || '';
    setActiveHabitId(initialId);

    setTimeout(() => {
      setIsAppReady(true);
    }, 150);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keep each habit's stored bestStreakDays in sync with its live streak,
  // so the best badge never shows a stale number after the run ends or
  // the start date is edited. Functional form avoids stale-closure
  // overwrites of concurrent reset/edit updates.
  useEffect(() => {
    setHabits((prev) => {
      if (prev.length === 0) return prev;
      const now = Date.now();
      let changed = false;
      const updated = prev.map((h) => {
        // Same calculator the UI uses, so the persisted best always matches
        // what the card shows. `{ ...h }` carries `dailyLogs` through untouched.
        const best = calculateStreak(h, now).bestStreakDays;
        if (best > (h.bestStreakDays || 0)) {
          changed = true;
          return { ...h, bestStreakDays: best };
        }
        return h;
      });
      if (changed) {
        return updated;
      }
      return prev;
    });
  }, [habits, nowTick]);

  // Flush `habits` to storage once, after React has committed, whenever the
  // habit list actually changes. This replaces the side effects that used to
  // live inside the state updaters.
  useEffect(() => {
    if (habits.length === 0) return;
    StorageService.saveHabits(habits);
  }, [habits]);

  const currentHabit = habits.find((h) => h.id === activeHabitId) || habits[0];

  // Settings writes: UI updates instantly, storage writes debounce ~150ms
  // and always flush on release / hide / app pause so nothing is lost.
  const settingsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSettingsRef = useRef<AppSettings | null>(null);

  const flushSettings = useCallback(() => {
    if (settingsSaveTimer.current) {
      clearTimeout(settingsSaveTimer.current);
      settingsSaveTimer.current = null;
    }
    const pending = pendingSettingsRef.current;
    pendingSettingsRef.current = null;
    if (pending) {
      try {
        StorageService.saveSettings(pending);
      } catch {
        // Storage failure must never crash the app.
      }
    }
  }, []);

  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    pendingSettingsRef.current = newSettings;
    if (settingsSaveTimer.current) clearTimeout(settingsSaveTimer.current);
    settingsSaveTimer.current = setTimeout(flushSettings, 150);
  }, [flushSettings]);

  useEffect(() => {
    const onPointerUp = () => flushSettings();
    const onVisibility = () => {
      if (document.hidden) flushSettings();
    };
    const onBeforeUnload = () => flushSettings();
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    let cancelCapState: (() => void) | undefined;
    import('@capacitor/app')
      .then(({ App: CapApp }) => {
        CapApp.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) flushSettings();
        })
          .then((h) => {
            cancelCapState = () => h.remove();
          })
          .catch(() => {});
      })
      .catch(() => {});
    return () => {
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
      cancelCapState?.();
      flushSettings();
    };
  }, [flushSettings]);

  const handleSelectHabit = useCallback((id: string) => {
    setActiveHabitId(id);
    handleUpdateSettings({ ...settings, activeHabitId: id });
  }, [settings, handleUpdateSettings]);

  // Persistence is handled by the single `useEffect` on `habits` above, so
  // these handlers only have to produce the next state.
  const handleAddHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const targetDays = settings.targetDays ?? DEFAULT_TARGET_DAYS;
    const newHabit: Habit = {
      ...habitData,
      targetDays,
      // Random suffix: two rapid saves in the same millisecond must never
      // share an id (React keys + SVG gradient ids would collide and cards
      // would visually overlap).
      id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      dailyLogs: {},
    };
    setHabits((prev) => [...prev, newHabit]);
    handleSelectHabit(newHabit.id);
  }, [settings.targetDays, handleSelectHabit]);

  // Streak goal from Settings: applies to every habit's progress ring at once.
  const handlePickTargetDays = useCallback((days: number) => {
    const next = normalizeTargetDays(days);
    handleUpdateSettings({ ...settings, targetDays: next });
    setHabits((prev) => prev.map((h) => ({ ...h, targetDays: next })));
  }, [settings, handleUpdateSettings]);

  const handleUpdateHabit = useCallback((updatedHabit: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  }, []);

  const handleDeleteHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const remaining = prev.filter((h) => h.id !== id);
      if (activeHabitId === id && remaining.length > 0) {
        queueMicrotask(() => handleSelectHabit(remaining[0].id));
      }
      return remaining;
    });
  }, [activeHabitId, handleSelectHabit]);

  const handleResetHabit = useCallback((habit: Habit) => {
    // Full reset: both the current streak and the best badge go back to 0.
    // (Previously best was preserved, which is why the circled badge stayed
    // at 1d while the big counter correctly went to 0.)
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, startDate: new Date().toISOString(), bestStreakDays: 0, dailyLogs: {} }
          : h
      )
    );
  }, []);

  // Mark a single calendar day from the Stats screen.
  //
  // Two rules matter here:
  //  1. Immutability — the updater always builds brand-new objects (new habit
  //     object + new `dailyLogs` object), never mutating in place, so React sees
  //     a new reference and re-renders the calendar.
  //  2. No side effects inside the updater — the `localStorage` write happens
  //     after commit. React may invoke an updater more than once (concurrent
  //     rendering / StrictMode), so writing from inside can persist a state
  //     that was ultimately discarded and silently clobber the newer mark.
  const handleMarkDay = useCallback((habitId: string, dateKey: string, status: DailyStatus) => {
    setHabits((prev) => {
      const target = prev.find((h) => h.id === habitId);
      if (!target) return prev;
      return prev.map((h) =>
        h.id === habitId ? { ...h, dailyLogs: setDailyStatus(h.dailyLogs, dateKey, status) } : h
      );
    });
  }, []);

  const isRoot = activeScreen === 'home';

  const handleNavigateToDetails = useCallback((id: string) => {
    handleSelectHabit(id);
    setActiveScreen('edit');
  }, [handleSelectHabit]);

  const handleNavigateToEdit = useCallback((h: Habit) => {
    handleSelectHabit(h.id);
    setActiveScreen('edit');
  }, [handleSelectHabit]);

  const handleAddNewHabit = useCallback(() => {
    setActiveHabitId('');
    setActiveScreen('edit');
  }, []);

  const handleNavigateBack = useCallback(() => setActiveScreen('home'), []);
  const handleNavigate = useCallback((screen: ScreenType) => setActiveScreen(screen), []);
  const handleAddFromNav = useCallback(() => {
    setActiveHabitId('');
    setActiveScreen('edit');
  }, []);

  const screenTitle =
    activeScreen === 'home'
      ? 'Momentum'
      : activeScreen === 'stats'
      ? 'Stats'
      : activeScreen === 'settings'
      ? 'Settings'
      : activeScreen === 'about'
      ? 'About'
      : activeScreen === 'edit'
      ? 'Edit Habit'
      : 'Android Kotlin Code';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans p-0 sm:p-4 transition-colors duration-200">
      <AnimatePresence>
        {!isAppReady && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center space-y-3"
          >
            <Wordmark showPro={false} className="wordmark-enter" logo={logoSettings} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Device View Mode Switcher (Large screens) */}
      <div className="fixed top-3 right-3 z-50 hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-full shadow-md">
        <button
          onClick={() => setActiveScreen('kotlin_code')}
          className={`px-3 py-1 rounded-full font-semibold transition-colors ${
 activeScreen === 'kotlin_code'
 ? 'bg-white text-zinc-950'
 : 'text-slate-300 hover:text-white'
 }`}
        >
          View Kotlin Code
        </button>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`p-1.5 rounded-full font-semibold transition-colors ${
 isPhoneFrame && activeScreen !== 'kotlin_code'
 ? 'bg-white text-zinc-950'
 : 'text-slate-400 hover:text-white'
 }`}
          title="Phone Bezel"
        >
          <Smartphone className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setIsPhoneFrame(false);
            if (activeScreen === 'kotlin_code') setActiveScreen('home');
          }}
          className={`p-1.5 rounded-full font-semibold transition-colors ${
 !isPhoneFrame && activeScreen !== 'kotlin_code'
 ? 'bg-white text-zinc-950'
 : 'text-slate-400 hover:text-white'
 }`}
          title="Full App"
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container - Material 3 Device Frame.
          App-wide brightness applies here so every screen, dialog and the
          bottom bar dim/lift together. */}
      <div
        style={{ filter: `brightness(${normalizeBrightness(settings.brightnessPct) / 100})` }}
        className={`w-full bg-[#0F172A] flex flex-col relative overflow-hidden transition-colors duration-200 ${
 isPhoneFrame
 ? 'max-w-[420px] h-[100dvh] sm:h-[840px] sm:rounded-3xl sm:border sm:border-slate-800 sm:shadow-2xl'
 : 'max-w-xl h-[100dvh] sm:h-[90vh] sm:rounded-2xl sm:border sm:border-slate-800 shadow-xl'
 }`}
      >
        {/* Floating title + menu over content (no bar). Hidden where the
            screen owns its header (edit form, kotlin viewer). */}
        {activeScreen !== 'edit' && activeScreen !== 'kotlin_code' && (
          <FloatingHeader
            title={screenTitle}
            isRootScreen={isRoot}
            onNavigateBack={handleNavigateBack}
            logo={logoSettings}
          />
        )}

        {/* Screen Router with Fast Mobile 200ms Slide-In from Right + Fade Transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeScreen}
            initial={{ x: 14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -14, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1 min-h-0 overflow-hidden flex flex-col relative"
          >
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center" aria-hidden="true">
                  <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                </div>
              }
            >
            {activeScreen === 'home' && (
              <HomeScreenView
                habits={habits}
                onSelectHabit={handleSelectHabit}
                onNavigateToDetails={handleNavigateToDetails}
                onNavigateToEdit={handleNavigateToEdit}
                onResetHabit={handleResetHabit}
                onUpdateHabit={handleUpdateHabit}
                onAddNewHabit={handleAddNewHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            )}

            {activeScreen === 'stats' && (
              <AnalyticsScreen
                habit={currentHabit}
                habits={habits}
                relapseLogs={relapseLogs}
                onMarkDay={handleMarkDay}
                nowMs={nowTick}
                currentStreakDays={
                  currentHabit
                    ? Math.max(
                        0,
                        Math.floor((Date.now() - new Date(currentHabit.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      )
                    : 0
                }
              />
            )}

            {activeScreen === 'settings' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onPickTargetDays={handlePickTargetDays}
                onDataReload={loadData}
              />
            )}

            {activeScreen === 'about' && <AboutScreenView />}

            {activeScreen === 'edit' && (
              <HabitsManagerScreen
                habits={habits}
                activeHabitId={activeHabitId}
                onSelectHabit={handleSelectHabit}
                onAddHabit={handleAddHabit}
                onUpdateHabit={handleUpdateHabit}
                onDeleteHabit={handleDeleteHabit}
                onReorderHabits={() => {}}
                onBack={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'kotlin_code' && <KotlinCodeViewer />}
            </Suspense>

            {/* Android Toast Message for Double-Tap Exit */}
            {showExitToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 text-slate-100 font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm pointer-events-none transition-all duration-200 animate-fade-in border border-slate-700">
                Press back again to exit
              </div>
            )}
          </motion.main>
        </AnimatePresence>

        {/* Bottom glass navigation — hidden where the screen owns its chrome. */}
        {activeScreen !== 'edit' && activeScreen !== 'kotlin_code' && (
          <BottomNav
            activeScreen={activeScreen}
            onNavigate={handleNavigate}
            onAdd={handleAddFromNav}
          />
        )}
      </div>
    </div>
  );
}
