import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Habit, RelapseLog, AppSettings } from './types/habit';
import { StorageService } from './services/storage';
import { TopAppBar } from './components/TopAppBar';
import { HomeScreenView } from './components/HomeScreenView';
import { HabitsManagerScreen } from './components/HabitsManagerScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AboutScreenView } from './components/AboutScreenView';
import { KotlinCodeViewer } from './components/KotlinCodeViewer';
import { Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Dark Mode state to HTML documentElement and Capacitor StatusBar
  useEffect(() => {
    const isDark = Boolean(settings.darkMode);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Try setting Capacitor native status bar style (Bonus)
    try {
      if (typeof StatusBar !== 'undefined' && StatusBar.setStyle) {
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
        if (StatusBar.setBackgroundColor) {
          StatusBar.setBackgroundColor({ color: isDark ? '#0f172a' : '#ffffff' }).catch(() => {});
        }
      }
    } catch {
      // Ignored for environments without native plugins
    }
  }, [settings.darkMode]);

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
            Haptics.impact({ style: ImpactStyle.Light });
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

    // Clean up listener on unmount
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      CapacitorApp.removeAllListeners();
    };
  }, [activeScreen]);

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

  const currentHabit = habits.find((h) => h.id === activeHabitId) || habits[0];

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleSelectHabit = (id: string) => {
    setActiveHabitId(id);
    const updated = { ...settings, activeHabitId: id };
    handleUpdateSettings(updated);
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    StorageService.saveHabits(updated);
    handleSelectHabit(newHabit.id);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    const updated = habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h));
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    StorageService.saveHabits(updated);
    if (activeHabitId === id && updated.length > 0) {
      handleSelectHabit(updated[0].id);
    }
  };

  const handleResetHabit = (habit: Habit) => {
    const start = new Date(habit.startDate).getTime();
    const currentDays = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
    const newBest = Math.max(habit.bestStreakDays, currentDays);

    const resetHabit: Habit = {
      ...habit,
      startDate: new Date().toISOString(),
      bestStreakDays: newBest,
    };
    handleUpdateHabit(resetHabit);
  };

  const isRoot = activeScreen === 'home';

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
    <div className="min-h-screen bg-gray-200 dark:bg-slate-950 flex flex-col items-center justify-center text-gray-900 dark:text-slate-100 font-sans p-0 sm:p-4 transition-colors duration-200">
      <AnimatePresence>
        {!isAppReady && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-[#0F172A] flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00897B] flex items-center justify-center text-2xl shadow-lg text-white font-bold">
              M
            </div>
            <span className="text-xl font-extrabold tracking-tight animate-text-shimmer">
              Momentum
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Device View Mode Switcher (Large screens) */}
      <div className="fixed top-3 right-3 z-50 hidden lg:flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1 rounded-full shadow-md">
        <button
          onClick={() => setActiveScreen('kotlin_code')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            activeScreen === 'kotlin_code'
              ? 'bg-teal-600 text-white'
              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          View Kotlin Code
        </button>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`p-1.5 rounded-full text-xs font-semibold transition-colors ${
            isPhoneFrame && activeScreen !== 'kotlin_code'
              ? 'bg-teal-600 text-white'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
          className={`p-1.5 rounded-full text-xs font-semibold transition-colors ${
            !isPhoneFrame && activeScreen !== 'kotlin_code'
              ? 'bg-teal-600 text-white'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Full App"
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container - Material 3 Device Frame */}
      <div
        className={`w-full bg-[#F2F4F7] dark:bg-[#0F172A] flex flex-col relative overflow-hidden transition-colors duration-200 ${
          isPhoneFrame
            ? 'max-w-[420px] h-[100dvh] sm:h-[840px] sm:rounded-3xl sm:border sm:border-gray-300 dark:sm:border-slate-800 sm:shadow-2xl'
            : 'max-w-xl h-[100dvh] sm:h-[90vh] sm:rounded-2xl sm:border sm:border-gray-300 dark:sm:border-slate-800 shadow-xl'
        }`}
      >
        {/* Top App Bar with 3-dot overflow menu (Stats, Settings, About) or Back arrow */}
        <TopAppBar
          title={screenTitle}
          isRootScreen={isRoot}
          onNavigateBack={() => setActiveScreen('home')}
          onNavigateToStats={() => setActiveScreen('stats')}
          onNavigateToSettings={() => setActiveScreen('settings')}
          onNavigateToAbout={() => setActiveScreen('about')}
        />

        {/* Screen Router with Fast Mobile 200ms Slide-In from Right + Fade Transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeScreen}
            initial={{ x: 14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -14, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1 overflow-hidden flex flex-col relative"
          >
            {activeScreen === 'home' && (
              <HomeScreenView
                habits={habits}
                onSelectHabit={handleSelectHabit}
                onNavigateToDetails={(id) => {
                  handleSelectHabit(id);
                  setActiveScreen('edit');
                }}
                onNavigateToEdit={(h) => {
                  handleSelectHabit(h.id);
                  setActiveScreen('edit');
                }}
                onResetHabit={handleResetHabit}
                onUpdateHabit={handleUpdateHabit}
                onAddNewHabit={() => {
                  setActiveHabitId('');
                  setActiveScreen('edit');
                }}
                onDeleteHabit={handleDeleteHabit}
              />
            )}

            {activeScreen === 'stats' && (
              <AnalyticsScreen
                habit={currentHabit}
                habits={habits}
                relapseLogs={relapseLogs}
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

            {/* Android Toast Message for Double-Tap Exit */}
            {showExitToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 dark:bg-slate-800/95 text-white dark:text-slate-100 text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm pointer-events-none transition-all duration-200 animate-fade-in border border-gray-700/50 dark:border-slate-700">
                Press back again to exit
              </div>
            )}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
