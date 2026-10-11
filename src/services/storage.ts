import {
  Habit,
  RelapseLog,
  AppSettings,
  DEFAULT_TRANSPARENCY_LEVEL,
  normalizeTransparencyLevel,
  DEFAULT_TARGET_DAYS,
  normalizeTargetDays,
  DEFAULT_BACKGROUND_ID,
  normalizeBackgroundId,
  DEFAULT_BG_BLUR,
  normalizeBgBlur,
  DEFAULT_BRIGHTNESS,
  normalizeBrightness,
  DEFAULT_LOGO,
  normalizeLogo,
  migrateHabitColor,
} from '../types/habit';

const STORAGE_KEYS = {
  HABITS: 'nofap_habits_v1',
  RELAPSE_LOGS: 'nofap_relapses_v1',
  SETTINGS: 'nofap_settings_v1',
};

export const INITIAL_HABITS: Habit[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  reminderEnabled: false,
  reminderTime: '20:00',
  dynamicColors: true,
  pinLockEnabled: false,
  pinCode: '',
  hapticsEnabled: true,
  activeHabitId: '',
  counterDisplayUnit: 'detailed',
  dailyCheckInReminder: true,
  textColor: 'white',
  transparencyLevel: DEFAULT_TRANSPARENCY_LEVEL,
  targetDays: DEFAULT_TARGET_DAYS,
  backgroundId: DEFAULT_BACKGROUND_ID,
  bgBlurPx: DEFAULT_BG_BLUR,
  brightnessPct: DEFAULT_BRIGHTNESS,
  logo: DEFAULT_LOGO,
};

export const INITIAL_RELAPSES: RelapseLog[] = [];

export const StorageService = {
  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) {
        const parsed = JSON.parse(data) as Habit[];
        // Habits created before the calendar existed have no `dailyLogs`.
        // Normalise so every consumer can read it without optional chaining.
        // Also migrates legacy muted habit colours to the bright palette.
        const normalized = parsed.map((h) => {
          const withLogs =
            h.dailyLogs && typeof h.dailyLogs === 'object'
              ? h
              : { ...h, dailyLogs: {} as NonNullable<Habit['dailyLogs']> };
          const migratedColor = migrateHabitColor(withLogs.color || '');
          return migratedColor !== withLogs.color
            ? { ...withLogs, color: migratedColor }
            : withLogs;
        });
        // De-duplicate ids (React keys + SVG gradient ids must be unique or
        // cards render on top of each other).
        const seen = new Set<string>();
        let dupes = false;
        for (const h of normalized) {
          if (seen.has(h.id)) {
            h.id = `${h.id}_${Math.random().toString(36).slice(2, 8)}`;
            dupes = true;
          }
          seen.add(h.id);
        }
        if (dupes || normalized.some((h, i) => h !== parsed[i])) this.saveHabits(normalized);
        return normalized;
      }
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
      if (data) {
        const parsed = JSON.parse(data) as AppSettings & { darkMode?: boolean };

        // Permanently dark: drop any legacy theme preference.
        const { darkMode: _removed, ...withoutTheme } = parsed;

        // Merge over the defaults so settings added in later versions
        // (textColor, transparencyLevel, …) exist for existing installs
        // instead of coming back undefined.
        const merged: AppSettings = { ...INITIAL_SETTINGS, ...withoutTheme };

        // Migrates the old 1…6 scale (and any corrupt value) into 5…10.
        merged.transparencyLevel = normalizeTransparencyLevel(merged.transparencyLevel);

        // Streak goal added later — normalize so old installs get the default.
        merged.targetDays = normalizeTargetDays(merged.targetDays);

        // Background picker added later — same migration.
        merged.backgroundId = normalizeBackgroundId(merged.backgroundId);

        // Background blur added later — same migration.
        merged.bgBlurPx = normalizeBgBlur(merged.bgBlurPx);

        // App brightness added later — same migration.
        merged.brightnessPct = normalizeBrightness(merged.brightnessPct);

        // Logo customization added later — same migration.
        merged.logo = normalizeLogo(merged.logo);

        this.saveSettings(merged);
        return merged;
      }
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
