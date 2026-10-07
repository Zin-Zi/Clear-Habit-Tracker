import { Habit, RelapseLog, AppSettings, Milestone } from '../types/habit';

const STORAGE_KEYS = {
  HABITS: 'nofap_habits_v1',
  RELAPSE_LOGS: 'nofap_relapses_v1',
  SETTINGS: 'nofap_settings_v1',
};

export const DEFAULT_MILESTONES: Milestone[] = [
  { days: 1, title: 'Day 1: The Spark', description: 'The journey of a thousand miles begins with a single step.', icon: '🌱', color: '#10B981' },
  { days: 3, title: 'Day 3: Breaking the Loop', description: 'Surpassed the initial withdrawal peak. Dopamine receptors begin resting.', icon: '🌿', color: '#06B6D4' },
  { days: 7, title: 'Day 7: Testosterone Peak & Clarity', description: 'One full week of self-control. Energy and mental fog begin lifting.', icon: '⚡', color: '#3B82F6' },
  { days: 14, title: 'Day 14: Fortified Willpower', description: 'Two weeks clean. Habitual triggers lose their primary automatic grip.', icon: '🛡️', color: '#6366F1' },
  { days: 21, title: 'Day 21: Neural Pathway Rewiring', description: '21 days to break an old reflex and build a new conscious baseline.', icon: '🧠', color: '#8B5CF6' },
  { days: 30, title: 'Day 30: One Month Titan', description: 'One entire month. Self-respect, confidence, and focus surge.', icon: '🏆', color: '#EC4899' },
  { days: 60, title: 'Day 60: The Diamond Phase', description: 'Urges are now manageable ripples rather than overwhelming tsunamis.', icon: '💎', color: '#F59E0B' },
  { days: 90, title: 'Day 90: Complete Brain Reboot', description: 'The legendary 90-day reset. Full neural baseline restoration.', icon: '👑', color: '#EF4444' },
  { days: 180, title: 'Day 180: Master of Impulse', description: 'Half a year of continuous discipline. A completely renewed lifestyle.', icon: '🔥', color: '#F97316' },
  { days: 365, title: 'Day 365: Transcendent Legend', description: 'One full year. True freedom, unwavering clarity and life mastery.', icon: '🌟', color: '#EAB308' },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit_nofap_main',
    name: 'NoFap & Porn Free',
    description: 'Zero PMO. Reclaim dopamine baseline & mental clarity.',
    icon: '🛡️',
    color: '#3B82F6',
    startDate: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
    bestStreakDays: 14,
    targetDays: 90,
    order: 0,
    pledge: 'I choose long-term self-respect and mental clarity over 5 seconds of cheap dopamine.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'habit_cold_showers',
    name: 'Cold Showers',
    description: '3 minutes ice-cold water every morning for willpower.',
    icon: '🚿',
    color: '#06B6D4',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    bestStreakDays: 7,
    targetDays: 30,
    order: 1,
    pledge: 'Step into voluntary discomfort to build unshakeable mental toughness.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'habit_meditation',
    name: 'Daily Mindfulness & Meditation',
    description: '10 minutes of non-judgmental breath awareness.',
    icon: '🧘',
    color: '#10B981',
    startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    bestStreakDays: 12,
    targetDays: 30,
    order: 2,
    pledge: 'Observe urges without reacting to them.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'habit_no_doomscroll',
    name: 'No Late-Night Doomscrolling',
    description: 'No screen in bed after 10:30 PM. Protect sleep and reduce triggers.',
    icon: '📵',
    color: '#8B5CF6',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bestStreakDays: 5,
    targetDays: 21,
    order: 3,
    pledge: 'My bedtime is for rest and recovery, not mindless algorithmic feeds.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  reminderEnabled: false,
  reminderTime: '20:00',
  dynamicColors: true,
  pinLockEnabled: false,
  pinCode: '',
  hapticsEnabled: true,
  activeHabitId: 'habit_nofap_main',
  counterDisplayUnit: 'detailed',
  dailyCheckInReminder: true,
};

export const INITIAL_RELAPSES: RelapseLog[] = [
  {
    id: 'relapse_seed_1',
    habitId: 'habit_nofap_main',
    habitName: 'NoFap & Porn Free',
    timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
    streakDaysAtRelapse: 14,
    trigger: '📱 Late Night Phone in Bed',
    mood: 'Tired & Stressed',
    notes: 'Stayed up past 1 AM browsing social media.',
    lessonLearned: 'Keep phone charged outside bedroom. Go to bed immediately when tired.',
  },
];

export const StorageService = {
  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load habits', e);
    }
    this.saveHabits(INITIAL_HABITS);
    return INITIAL_HABITS;
  },

  saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  },

  getRelapseLogs(): RelapseLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RELAPSE_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load relapse logs', e);
    }
    this.saveRelapseLogs(INITIAL_RELAPSES);
    return INITIAL_RELAPSES;
  },

  saveRelapseLogs(logs: RelapseLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RELAPSE_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save relapse logs', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  clearAllData(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
