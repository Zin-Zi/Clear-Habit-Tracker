import React, { useState, useEffect } from 'react';
import { Habit, RelapseLog, AppSettings } from './types/habit';
import { StorageService } from './services/storage';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { TopAppBar } from './components/TopAppBar';
import { HomeScreenView } from './components/HomeScreenView';
import { HabitsManagerScreen } from './components/HabitsManagerScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AboutScreenView } from './components/AboutScreenView';
import { KotlinCodeViewer } from './components/KotlinCodeViewer';
import { Smartphone, Monitor } from 'lucide-react';

export type ScreenType = 'home' | 'stats' | 'settings' | 'about' | 'edit' | 'kotlin_code';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabitId, setActiveHabitId] = useState<string>('');
  const [relapseLogs, setRelapseLogs] = useState<RelapseLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Initial load
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentHabit = habits.find((h) => h.id === activeHabitId) || habits[0];

  const handleSelectHabit = (id: string) => {
    setActiveHabitId(id);
    const updated = { ...settings, activeHabitId: id };
    setSettings(updated);
    StorageService.saveSettings(updated);
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
      ? 'NoFap Counter'
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
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center text-gray-900 font-sans p-0 sm:p-4">
      {/* Device View Mode Switcher (Large screens) */}
      <div className="fixed top-3 right-3 z-50 hidden lg:flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-full shadow-md">
        <button
          onClick={() => setActiveScreen('kotlin_code')}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            activeScreen === 'kotlin_code' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View Kotlin Code
        </button>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`p-1.5 rounded-full text-xs font-semibold ${
            isPhoneFrame && activeScreen !== 'kotlin_code' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-900'
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
          className={`p-1.5 rounded-full text-xs font-semibold ${
            !isPhoneFrame && activeScreen !== 'kotlin_code' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
          title="Full App"
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container - Material 3 Device Frame */}
      <div
        className={`w-full bg-[#F5F5F5] flex flex-col relative overflow-hidden ${
          isPhoneFrame
            ? 'max-w-[420px] h-[100dvh] sm:h-[840px] sm:rounded-3xl sm:border sm:border-gray-300 sm:shadow-2xl'
            : 'max-w-xl h-[100dvh] sm:h-[90vh] sm:rounded-2xl sm:border sm:border-gray-300 shadow-xl'
        }`}
      >
        {/* Android Status Bar */}
        <AndroidStatusBar />

        {/* Top App Bar with 3-dot overflow menu (Stats, Settings, About) or Back arrow */}
        <TopAppBar
          title={screenTitle}
          isRootScreen={isRoot}
          onNavigateBack={() => setActiveScreen('home')}
          onNavigateToStats={() => setActiveScreen('stats')}
          onNavigateToSettings={() => setActiveScreen('settings')}
          onNavigateToAbout={() => setActiveScreen('about')}
        />

        {/* Screen Router with Smooth 300ms Slide+Fade Transition */}
        <main key={activeScreen} className="flex-1 overflow-hidden flex flex-col animate-screen-enter">
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
              onUpdateSettings={(s) => {
                setSettings(s);
                StorageService.saveSettings(s);
              }}
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
        </main>
      </div>
    </div>
  );
}
