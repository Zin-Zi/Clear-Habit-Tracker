export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  startDate: string; // ISO string
  bestStreakDays: number;
  targetDays: number;
  order: number;
  isArchived?: boolean;
  pledge?: string;
  createdAt: string;
}

export interface RelapseLog {
  id: string;
  habitId: string;
  habitName: string;
  timestamp: string; // ISO string
  streakDaysAtRelapse: number;
  trigger: string;
  mood: string;
  notes: string;
  lessonLearned: string;
}

export interface Milestone {
  days: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AppSettings {
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  dynamicColors?: boolean;
  pinLockEnabled?: boolean;
  pinCode?: string;
  hapticsEnabled?: boolean;
  activeHabitId?: string;
  counterDisplayUnit?: 'detailed' | 'days_only' | 'compact';
  dailyCheckInReminder?: boolean;
}
