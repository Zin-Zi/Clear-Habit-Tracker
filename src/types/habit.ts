/**
 * Per-day manual status recorded from the Stats calendar.
 * Keyed by local calendar date in `YYYY-MM-DD` form.
 * `unmarked` is stored as an absent key (we delete it) — the union member is
 * kept so consumers can treat a missing key and an explicit `unmarked` the same.
 */
export type DailyStatus = 'done' | 'skipped' | 'unmarked';

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
  completedDates?: string[];
  /**
   * Manual daily marks from the calendar, e.g.
   * `{ "2026-10-08": "done", "2026-10-09": "skipped" }`.
   * Orthogonal to `startDate`: the streak counter stays purely time-based
   * (24-hour cycles since `startDate`); these marks are an annotation layer
   * that never moves the streak. See `dailyLogs.ts` for the date helpers.
   */
  dailyLogs?: Record<string, DailyStatus>;
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

interface Milestone {
  days: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AppSettings {
  /* No theme field: the app is permanently dark. */
  reminderEnabled: boolean;
  reminderTime: string;
  dynamicColors?: boolean;
  pinLockEnabled?: boolean;
  pinCode?: string;
  /** Master switch for all Haptics plugin calls. */
  hapticsEnabled?: boolean;
  activeHabitId?: string;
  counterDisplayUnit?: 'detailed' | 'days_only' | 'compact';
  dailyCheckInReminder?: boolean;
  /** Key into TEXT_COLOR_OPTIONS. */
  textColor?: string;
  /** 1 (most opaque) … 6 (most transparent). */
  transparencyLevel?: number;
  /** Streak goal in days — drives every habit's progress ring. */
  targetDays?: number;
  /** Key into BACKGROUND_OPTIONS. */
  backgroundId?: string;
  /** Wallpaper blur radius in px (0…20). */
  bgBlurPx?: number;
  /** Whole-app brightness percent (40…130). */
  brightnessPct?: number;
  /** Header logo customization. */
  logo?: LogoSettings;
}

export const MIN_TARGET_DAYS = 1;
export const MAX_TARGET_DAYS = 365;
export const DEFAULT_TARGET_DAYS = 90;

export const MIN_BG_BLUR = 0;
export const MAX_BG_BLUR = 20;
export const DEFAULT_BG_BLUR = 0;

export const MIN_BRIGHTNESS = 40;
export const MAX_BRIGHTNESS = 130;
export const DEFAULT_BRIGHTNESS = 100;

/** Coerces any stored value into a valid 40…130 brightness percent. */
export const normalizeBrightness = (value: unknown): number => {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n)) return DEFAULT_BRIGHTNESS;
  const rounded = Math.round(n);
  if (rounded < MIN_BRIGHTNESS) return MIN_BRIGHTNESS;
  if (rounded > MAX_BRIGHTNESS) return MAX_BRIGHTNESS;
  return rounded;
};

/** Coerces any stored value into a valid 0…20 blur radius. */
export const normalizeBgBlur = (value: unknown): number => {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n)) return DEFAULT_BG_BLUR;
  const rounded = Math.round(n);
  if (rounded < MIN_BG_BLUR) return MIN_BG_BLUR;
  if (rounded > MAX_BG_BLUR) return MAX_BG_BLUR;
  return rounded;
};

/* One-time migration: habits saved with the old muted palette get the
   matching bright tone so old and new cards look identical. */
const LEGACY_COLOR_MAP: Record<string, string> = {
  '#00897B': '#2DD4BF',
  '#10B981': '#34D399',
  '#2563EB': '#3B82F6',
  '#0284C7': '#38BDF8',
  '#6366F1': '#818CF1',
  '#7C3AED': '#A78BFA',
  '#EC4899': '#F472B6',
  '#E11D48': '#FB7185',
  '#F97316': '#FB923C',
  '#D97706': '#FBBF24',
  '#84CC16': '#A3E635',
  '#64748B': '#94A3B8',
};

export const migrateHabitColor = (color: string): string =>
  LEGACY_COLOR_MAP[color.toUpperCase()] ?? color;
/** Coerces any stored value into a valid 1…365 day goal. */
export const normalizeTargetDays = (value: unknown): number => {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n)) return DEFAULT_TARGET_DAYS;
  const rounded = Math.round(n);
  if (rounded < MIN_TARGET_DAYS) return MIN_TARGET_DAYS;
  if (rounded > MAX_TARGET_DAYS) return MAX_TARGET_DAYS;
  return rounded;
};

/** 5 bundled local backgrounds (offline-safe). File lives in public/images. */
export interface BackgroundOption {
  id: string;
  label: string;
  file: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'bg-1', label: 'Runner', file: '/images/bg-1.jpg' },
  { id: 'bg-2', label: 'Sprint', file: '/images/bg-2.jpg' },
  { id: 'bg-3', label: 'Track', file: '/images/bg-3.jpg' },
  { id: 'bg-4', label: 'Gym', file: '/images/bg-4.jpg' },
  { id: 'bg-5', label: 'Focus', file: '/images/bg-5.jpg' },
  { id: 'bg-white', label: 'White', file: '/images/bg-white.png' },
  { id: 'bg-black', label: 'Black', file: '/images/bg-black.png' },
];

export const DEFAULT_BACKGROUND_ID = 'bg-1';

/** Coerces any stored value into a valid background id. */
export const normalizeBackgroundId = (value: unknown): string => {
  if (typeof value === 'string' && BACKGROUND_OPTIONS.some((o) => o.id === value)) {
    return value;
  }
  return DEFAULT_BACKGROUND_ID;
};

/** Per-user logo customization, applied to the header wordmark. */
export interface LogoSettings {
  /** Primary text color, #rrggbb. */
  color: string;
  /** When true, paint a color → color2 gradient instead of solid color. */
  gradient: boolean;
  /** Gradient end color, #rrggbb. */
  color2: string;
  /** Cap height in px the user picked (18…40); header clamps it to fit. */
  size: number;
  /** Key into the logo font list (see Wordmark LOGO_FONTS). */
  fontFamily: string;
  /** 400 | 500 | 700 | 900. */
  fontWeight: number;
}

const LOGO_FONT_IDS = ['sora', 'outfit', 'grotesk', 'playfair', 'jetbrains', 'fredoka'] as const;
export const LOGO_WEIGHTS = [400, 500, 700, 900] as const;
export const MIN_LOGO_SIZE = 18;
export const MAX_LOGO_SIZE = 40;
/** Header clamps the picked size so the word + badge never overflow 375px. */
export const MAX_LOGO_DISPLAY_SIZE = 32;

export const DEFAULT_LOGO: LogoSettings = {
  color: '#5eead4',
  gradient: true,
  color2: '#a78bfa',
  size: 20,
  fontFamily: 'sora',
  fontWeight: 700,
};

const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

/** Coerces any stored value into a complete, valid logo setting. */
export const normalizeLogo = (value: unknown): LogoSettings => {
  const v = (value ?? {}) as Partial<LogoSettings>;
  const size = typeof v.size === 'number' && Number.isFinite(v.size) ? Math.round(v.size) : DEFAULT_LOGO.size;
  const weight = typeof v.fontWeight === 'number' ? v.fontWeight : DEFAULT_LOGO.fontWeight;
  return {
    color: isHexColor(v.color) ? v.color : DEFAULT_LOGO.color,
    gradient: v.gradient === undefined ? DEFAULT_LOGO.gradient : v.gradient === true,
    color2: isHexColor(v.color2) ? v.color2 : DEFAULT_LOGO.color2,
    size: Math.min(MAX_LOGO_SIZE, Math.max(MIN_LOGO_SIZE, size)),
    fontFamily: typeof v.fontFamily === 'string' && (LOGO_FONT_IDS as readonly string[]).includes(v.fontFamily)
      ? v.fontFamily
      : DEFAULT_LOGO.fontFamily,
    fontWeight: (LOGO_WEIGHTS as readonly number[]).includes(weight) ? weight : DEFAULT_LOGO.fontWeight,
  };
};

/** Predefined palette for the global primary text colour. */
export interface TextColorOption {
  id: string;
  label: string;
  value: string;
}

export const TEXT_COLOR_OPTIONS: TextColorOption[] = [
  { id: 'white', label: 'Pure White', value: '#ffffff' },
  { id: 'gold', label: 'Vivid Amber', value: '#fbbf24' },
  { id: 'teal', label: 'Electric Cyan', value: '#22d3ee' },
  { id: 'pink', label: 'Neon Pink', value: '#f472b6' },
  { id: 'blue', label: 'Bright Violet', value: '#a78bfa' },
  { id: 'gray', label: 'Lime Pop', value: '#a3e635' },
  { id: 'black', label: 'Pure Black', value: '#000000' },
  { id: 'orange', label: 'Sunset Orange', value: '#fb923c' },
  { id: 'emerald', label: 'Mint Emerald', value: '#34d399' },
  { id: 'sky', label: 'Sky Blue', value: '#38bdf8' },
  { id: 'rose', label: 'Coral Rose', value: '#fb7185' },
  { id: 'yellow', label: 'Lemon Yellow', value: '#fde047' },
];

/**
 * Glass fill alpha per transparency level.
 * Higher = clearer: 5 is the most solid, 10 is almost fully clear glass.
 */
export const TRANSPARENCY_ALPHAS: Record<number, number> = {
  5: 0.45,
  6: 0.38,
  7: 0.3,
  8: 0.22,
  9: 0.15,
  10: 0.08,
};

export const MIN_TRANSPARENCY_LEVEL = 5;
export const MAX_TRANSPARENCY_LEVEL = 10;

/**
 * 7 is the middle of the range and lands on a balanced 0.30 alpha — glassy but
 * still comfortable to read over the photo.
 */
export const DEFAULT_TRANSPARENCY_LEVEL = 7;

/**
 * Coerces any stored value into a valid 5…10 level.
 * The scale used to be 1…6, so legacy 1–4 values migrate up to 5 (the new
 * most-transparent step) rather than being discarded.
 */
export const normalizeTransparencyLevel = (value: unknown): number => {
  // Only real numbers (or numeric strings) are considered. `Number(null)` is 0
  // and `Number(true)` is 1, which would wrongly migrate junk values to 5
  // instead of falling back to the default.
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n)) return DEFAULT_TRANSPARENCY_LEVEL;
  const rounded = Math.round(n);
  if (rounded < MIN_TRANSPARENCY_LEVEL) return MIN_TRANSPARENCY_LEVEL;
  if (rounded > MAX_TRANSPARENCY_LEVEL) return DEFAULT_TRANSPARENCY_LEVEL;
  return rounded;
};
