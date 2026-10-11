import React, { useState, useRef, Suspense } from 'react';
import {
  AppSettings,
  TEXT_COLOR_OPTIONS,
  BACKGROUND_OPTIONS,
  normalizeBackgroundId,
  MIN_TRANSPARENCY_LEVEL,
  MAX_TRANSPARENCY_LEVEL,
  normalizeTransparencyLevel,
  MIN_TARGET_DAYS,
  MAX_TARGET_DAYS,
  normalizeTargetDays,
  MIN_BG_BLUR,
  MAX_BG_BLUR,
  normalizeBgBlur,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  normalizeBrightness,
} from '../types/habit';
import { StorageService } from '../services/storage';
import { tapLight } from '../services/haptics';
import { Minus, Plus, ChevronDown, ChevronRight, Palette } from 'lucide-react';
import type { LogoSettings } from '../types/habit';
import { normalizeLogo } from '../types/habit';

const LogoSettingsModal = React.lazy(() =>
  import('./LogoSettingsModal').then((m) => ({ default: m.LogoSettingsModal }))
);

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onPickTargetDays: (days: number) => void;
  onDataReload: () => void;
}

/* ---- shared tokens: borderless floating glass, spacing separates sections ---- */
const CARD = 'transition-all duration-200 ease-in-out';
const ROW = 'flex w-full items-center gap-3 px-1 py-2 min-h-[48px] text-left cursor-pointer transition-all duration-200 ease-in-out';
const TITLE = 'text-sm font-bold leading-relaxed tracking-wide text-fixed-white drop-shadow-md';
const HELP = 'text-xs font-normal leading-relaxed text-fixed-white opacity-70 drop-shadow-sm';
const SECTION_LABEL =
  'px-1 mb-2 text-xs font-semibold uppercase tracking-widest text-fixed-white drop-shadow-sm';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]';

/**
 * Decorative switch track. The whole row is the real control (a
 * role="switch" button), so this only reflects state visually.
 */
const Switch: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    aria-hidden="true"
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 backdrop-blur-md shadow-xl cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:-translate-y-0.5 active:scale-95 ${
      on ? 'bg-white shadow-white/25' : 'bg-white/10'
    }`}
  >
    <span
      className={`h-5 w-5 rounded-full shadow-lg transition-all duration-200 ${
        on ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-white'
      }`}
    />
  </span>
);

/** Clean standalone floating label — no box, no border. */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className={SECTION_LABEL}>{children}</h2>
);

/* Collapsible dropdown section: header row with current-value summary +
   rotating chevron; body mounts only when open. */
const CollapsibleSection: React.FC<{
  label: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ label, summary, open, onToggle, children }) => (
  <section>
    <button
      type="button"
      onClick={() => {
        tapLight();
        onToggle();
      }}
      aria-expanded={open}
      className="flex w-full cursor-pointer items-center gap-2 px-1 py-1 text-left transition-all duration-200 ease-in-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-xl"
    >
      <span className="min-w-0 flex-1">
        <SectionLabel>{label}</SectionLabel>
      </span>
      {summary !== undefined && (
        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-zinc-100 shadow-md backdrop-blur-sm">
          {summary}
        </span>
      )}
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-200 ease-in-out ${
          open ? 'rotate-180' : ''
        }`}
        strokeWidth={2.5}
      />
    </button>
    {open && <div className={`${CARD} animate-fade-in`}>{children}</div>}
  </section>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onPickTargetDays,
  onDataReload,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('goal');
  const [logoOpen, setLogoOpen] = useState(false);
  const logoEntryRef = useRef<HTMLButtonElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  const logoSettings: LogoSettings = normalizeLogo(settings.logo);
  const handleUpdateLogo = (patch: Partial<LogoSettings>) => {
    onUpdateSettings({ ...settings, logo: { ...logoSettings, ...patch } });
  };
  const closeLogoModal = () => {
    setLogoOpen(false);
    logoEntryRef.current?.focus();
  };

  /* ---- derived state (unchanged logic) ---- */
  const isReminderEnabled = Boolean(settings.reminderEnabled);
  const reminderTime = settings.reminderTime || '20:00';
  const isHapticsOn = settings.hapticsEnabled !== false;
  const selectedTextColor = settings.textColor ?? 'white';
  const transparencyLevel = normalizeTransparencyLevel(settings.transparencyLevel);
  const targetDays = normalizeTargetDays(settings.targetDays);
  const backgroundId = normalizeBackgroundId(settings.backgroundId);
  const bgBlurPx = normalizeBgBlur(settings.bgBlurPx);
  const brightnessPct = normalizeBrightness(settings.brightnessPct);

  /* Direction: HIGHER = clearer. */
const transparencyHint =
    transparencyLevel >= 10
      ? 'Almost clear glass'
      : transparencyLevel >= 8
      ? 'Very clear'
      : transparencyLevel >= 6
      ? 'Balanced glass'
      : 'Solid';

  // Format 24h time string like "20:00" to readable "8:00 PM"
  const formatDisplayTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  /* ---- handlers (behaviour unchanged; each plays a light haptic) ---- */
  const handleToggleHaptics = () => {
    tapLight();
    onUpdateSettings({ ...settings, hapticsEnabled: !isHapticsOn });
  };

  const handleToggleReminder = () => {
    tapLight();
    onUpdateSettings({ ...settings, reminderEnabled: !isReminderEnabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onUpdateSettings({ ...settings, reminderTime: newTime });
  };

  const handleOpenTimePicker = () => {
    tapLight();
    try {
      if (timeInputRef.current?.showPicker) {
        timeInputRef.current.showPicker();
      } else {
        timeInputRef.current?.click();
      }
    } catch {
      timeInputRef.current?.click();
    }
  };

  const handlePickTextColor = (id: string) => {
    tapLight();
    onUpdateSettings({ ...settings, textColor: id });
  };

  const handlePickTransparency = (level: number) => {
    tapLight();
    onUpdateSettings({ ...settings, transparencyLevel: level });
  };

  const handlePickBackground = (id: string) => {
    tapLight();
    onUpdateSettings({ ...settings, backgroundId: id });
  };

  const handlePickBgBlur = (px: number) => {
    tapLight();
    onUpdateSettings({ ...settings, bgBlurPx: px });
  };

  const handlePickBrightness = (pct: number) => {
    tapLight();
    onUpdateSettings({ ...settings, brightnessPct: pct });
  };

  const handlePickTargetDays = (days: number) => {
    tapLight();
    onPickTargetDays(days);
  };

  const handleResetAllData = () => {
    StorageService.clearAllData();
    onDataReload();
    setShowConfirmReset(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-[#152036] text-gray-100 select-none relative">
      {/* Same wallpaper backdrop as Home — glass needs something to refract. */}
      <div className="home-bg" aria-hidden="true" />
      <div className="home-overlay" aria-hidden="true" />
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* pt-20 clears the floating header; pb-12 keeps the last card off the edge */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-16 pb-28 z-10 relative">
        <div className="mx-auto w-full max-w-md space-y-5">
          <CollapsibleSection
            label="Streak goal"
            summary={`${targetDays} days`}
            open={openSection === 'goal'}
            onToggle={() => toggleSection('goal')}
          >
            <div className={CARD}>
              <div className="px-1 py-1">
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                  <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md">Target days</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                    {targetDays} days
                  </span>
                </div>
                <p className={`${HELP} mt-0.5 px-1`}>
                  Applies to every habit's progress ring
                </p>
                <div className="mt-2 flex items-center gap-3" role="group" aria-label="Streak goal in days">
                  <button
                    type="button"
                    onClick={() => handlePickTargetDays(targetDays - 1)}
                    disabled={targetDays <= MIN_TARGET_DAYS}
                    aria-label="Decrease streak goal"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <span className="font-display text-2xl font-extrabold tabular-nums text-white drop-shadow-md">
                      {targetDays}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePickTargetDays(targetDays + 1)}
                    disabled={targetDays >= MAX_TARGET_DAYS}
                    aria-label="Increase streak goal"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
                <div className="mt-2 flex gap-2" role="group" aria-label="Preset streak goals">
                  {[30, 90, 180, 365].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePickTargetDays(preset)}
                      aria-pressed={targetDays === preset}
                      className={`h-8 min-w-0 flex-1 rounded-full text-[11px] font-bold tabular-nums backdrop-blur-md cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                        targetDays === preset
                          ? 'bg-white text-zinc-950 shadow-xl shadow-white/25 ring-2 ring-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white shadow-md'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Background"
            summary={BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)?.label ?? 'Runner'}
            open={openSection === 'background'}
            onToggle={() => toggleSection('background')}
          >
            <div className={CARD}>
              <div className="px-1 py-1">
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                  <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md">Wallpaper</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                    {BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)?.label ?? 'Runner'}
                  </span>
                </div>
                <p className={`${HELP} mt-0.5 px-1`}>
                  Bundled with the app — works offline
                </p>
                <div
                  role="group"
                  aria-label="Background wallpaper"
                  className="mt-2 grid grid-cols-5 gap-2"
                >
                  {BACKGROUND_OPTIONS.map((option) => {
                    const selected = backgroundId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handlePickBackground(option.id)}
                        aria-label={option.label}
                        aria-pressed={selected}
                        title={option.label}
                        className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ease-in-out focus-visible:outline-none"
                      >
                        <span
                          className={`block h-11 w-11 overflow-hidden rounded-full shadow-xl backdrop-blur-md cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 active:scale-95 ${
                            selected ? 'ring-2 ring-white scale-110 shadow-white/25' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={option.file}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover pointer-events-none"
                            loading="lazy"
                          />
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-in-out ${
                            selected ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 px-1">
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md">Background blur</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                      {bgBlurPx}px
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3" role="group" aria-label="Background blur in pixels">
                    <button
                      type="button"
                      onClick={() => handlePickBgBlur(bgBlurPx - 1)}
                      disabled={bgBlurPx <= MIN_BG_BLUR}
                      aria-label="Decrease background blur"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <input
                      type="range"
                      min={MIN_BG_BLUR}
                      max={MAX_BG_BLUR}
                      step={1}
                      value={bgBlurPx}
                      onChange={(e) => handlePickBgBlur(Number(e.target.value))}
                      aria-label={`Background blur ${bgBlurPx} pixels`}
                      className="glass-slider min-w-0 flex-1 cursor-pointer appearance-none rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      style={{
                        height: 8,
                        background: `linear-gradient(to right, #fafafa 0%, #a1a1aa ${
                          ((bgBlurPx - MIN_BG_BLUR) / (MAX_BG_BLUR - MIN_BG_BLUR)) * 100
                        }%, rgba(255,255,255,0.1) ${
                          ((bgBlurPx - MIN_BG_BLUR) / (MAX_BG_BLUR - MIN_BG_BLUR)) * 100
                        }%)`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handlePickBgBlur(bgBlurPx + 1)}
                      disabled={bgBlurPx >= MAX_BG_BLUR}
                      aria-label="Increase background blur"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Brightness"
            summary={`${brightnessPct}%`}
            open={openSection === 'brightness'}
            onToggle={() => toggleSection('brightness')}
          >
            <div className={CARD}>
              <div className="px-1 py-1">
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                  <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md">App brightness</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                    {brightnessPct}%
                  </span>
                </div>
                <p className={`${HELP} mt-0.5 px-1`}>
                  Dims or lifts the whole app at once
                </p>
                <div className="mt-2 flex items-center gap-3" role="group" aria-label="App brightness percent">
                  <button
                    type="button"
                    onClick={() => handlePickBrightness(brightnessPct - 5)}
                    disabled={brightnessPct <= MIN_BRIGHTNESS}
                    aria-label="Decrease brightness"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <input
                    type="range"
                    min={MIN_BRIGHTNESS}
                    max={MAX_BRIGHTNESS}
                    step={5}
                    value={brightnessPct}
                    onChange={(e) => handlePickBrightness(Number(e.target.value))}
                    aria-label={`App brightness ${brightnessPct} percent`}
                    className="glass-slider min-w-0 flex-1 cursor-pointer appearance-none rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={{
                      height: 8,
                      background: `linear-gradient(to right, #fafafa 0%, #a1a1aa ${
                        ((brightnessPct - MIN_BRIGHTNESS) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) * 100
                      }%, rgba(255,255,255,0.1) ${
                        ((brightnessPct - MIN_BRIGHTNESS) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) * 100
                      }%)`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePickBrightness(brightnessPct + 5)}
                    disabled={brightnessPct >= MAX_BRIGHTNESS}
                    aria-label="Increase brightness"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Transparency"
            summary={`${transparencyLevel} / ${MAX_TRANSPARENCY_LEVEL}`}
            open={openSection === 'transparency'}
            onToggle={() => toggleSection('transparency')}
          >
            <div className={CARD}>
              <div className="px-1 py-1">
                <div className="px-1 py-1 transition-all duration-200 ease-in-out">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md transition-all duration-200 ease-in-out">Transparency</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                    {transparencyLevel} / {MAX_TRANSPARENCY_LEVEL}
                  </span>
                </div>
                <p className={`${HELP} mt-0.5`}>{transparencyHint} · higher = clearer glass</p>
                </div>

                <div
                  role="group"
                  aria-label="Transparency level"
                  className="mt-2"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePickTransparency(Math.max(MIN_TRANSPARENCY_LEVEL, transparencyLevel - 1))}
                      disabled={transparencyLevel <= MIN_TRANSPARENCY_LEVEL}
                      aria-label="Decrease transparency"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <input
                      type="range"
                      min={MIN_TRANSPARENCY_LEVEL}
                      max={MAX_TRANSPARENCY_LEVEL}
                      step={1}
                      value={transparencyLevel}
                      onChange={(e) => handlePickTransparency(Number(e.target.value))}
                      aria-label={`Transparency level ${transparencyLevel} of ${MAX_TRANSPARENCY_LEVEL}`}
                      aria-valuetext={`${transparencyHint}, level ${transparencyLevel}`}
                      className="glass-slider min-w-0 flex-1 cursor-pointer appearance-none rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      style={{
                        height: 8,
                        background: `linear-gradient(to right, #fafafa 0%, #a1a1aa ${
                          ((transparencyLevel - MIN_TRANSPARENCY_LEVEL) /
                            (MAX_TRANSPARENCY_LEVEL - MIN_TRANSPARENCY_LEVEL)) *
                          100
                        }%, rgba(255,255,255,0.1) ${
                          ((transparencyLevel - MIN_TRANSPARENCY_LEVEL) /
                            (MAX_TRANSPARENCY_LEVEL - MIN_TRANSPARENCY_LEVEL)) *
                          100
                        }%)`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handlePickTransparency(Math.min(MAX_TRANSPARENCY_LEVEL, transparencyLevel + 1))}
                      disabled={transparencyLevel >= MAX_TRANSPARENCY_LEVEL}
                      aria-label="Increase transparency"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div aria-hidden="true" className="mt-1.5 flex justify-between px-12">
                    {Array.from(
                      { length: MAX_TRANSPARENCY_LEVEL - MIN_TRANSPARENCY_LEVEL + 1 },
                      (_, i) => i + MIN_TRANSPARENCY_LEVEL
                    ).map((level) => (
                      <span
                        key={level}
                        className={`text-[10px] font-bold tabular-nums transition-all duration-200 ease-in-out ${
                          level === transparencyLevel ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* ---------------- Logo ---------------- */}
          <section>
            <SectionLabel>Logo</SectionLabel>
            <div className={CARD}>
              <button
                ref={logoEntryRef}
                type="button"
                onClick={() => {
                  tapLight();
                  setLogoOpen(true);
                }}
                aria-label="Customize logo"
                aria-haspopup="dialog"
                className={`${ROW} ${FOCUS} hover:bg-white/5 active:bg-white/10 rounded-2xl`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md">
                  <Palette className="h-5 w-5 text-zinc-100" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1 px-1 py-1">
                  <span className={`${TITLE} block`}>Customize logo</span>
                  <span className={`${HELP} block mt-0.5`}>
                    Color, size, and font
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={2.5} />
              </button>
            </div>
          </section>

          <CollapsibleSection
            label="Text colour"
            summary={TEXT_COLOR_OPTIONS.find((o) => o.id === selectedTextColor)?.label ?? 'White'}
            open={openSection === 'textcolor'}
            onToggle={() => toggleSection('textcolor')}
          >
            <div className={CARD}>
              {/* Text colour */}
              <div className="px-1 py-1">
                <div className="px-1 py-1 transition-all duration-200 ease-in-out">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-bold tracking-wider text-fixed-white drop-shadow-md transition-all duration-200 ease-in-out">Text colour</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-zinc-100 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out">
                    {TEXT_COLOR_OPTIONS.find((o) => o.id === selectedTextColor)?.label ??
                      'White'}
                  </span>
                </div>
                <p className={`${HELP} mt-0.5`}>
                  Applies to titles, numbers and body text
                </p>
                </div>

                <div
                  role="group"
                  aria-label="Text colour"
                  /* Wrapping flex row of swatches: scales to any option count. */
                  className="mt-2 flex flex-wrap gap-3"
                >
                  {TEXT_COLOR_OPTIONS.map((option) => {
                    const selected = selectedTextColor === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handlePickTextColor(option.id)}
                        aria-label={option.label}
                        aria-pressed={selected}
                        title={option.label}
                        className={`relative flex h-10 w-10 items-center justify-center justify-self-center rounded-full border border-white/20 shadow-lg backdrop-blur-md cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${
                          selected
                            ? 'scale-110 ring-4 ring-white ring-offset-2 ring-offset-zinc-950 shadow-xl active:scale-95'
                            : 'hover:-translate-y-1.5 hover:scale-110 hover:shadow-xl hover:border-white/50 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: option.value,
                          ...(selected
                            ? {
                                boxShadow: `0 12px 28px -6px ${option.value}80, 0 0 20px ${option.value}66`,
                              }
                            : undefined),
                        }}
                      >
                        {selected && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: option.value, opacity: 0.35 }}
                          />
                        )}
                        {selected && (
                          <svg
                            viewBox="0 0 24 24"
                            className="relative h-5 w-5 text-slate-900 drop-shadow-sm"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3.5}
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Notifications"
            summary={isReminderEnabled ? 'On' : 'Off'}
            open={openSection === 'notifications'}
            onToggle={() => toggleSection('notifications')}
          >
            <div className={CARD}>
              <button
                type="button"
                role="switch"
                aria-checked={isReminderEnabled}
                onClick={handleToggleReminder}
                className={`${ROW} ${FOCUS} hover:bg-white/5 active:bg-white/10 rounded-2xl`}
              >
                <span className="min-w-0 flex-1 px-1 py-1 transition-all duration-200 ease-in-out">
                  <span className={`${TITLE} block`}>Daily reminder</span>
                  <span className={`${HELP} block mt-0.5`}>
                    A nudge at your chosen time each day
                  </span>
                </span>
                <Switch on={isReminderEnabled} />
              </button>

              {isReminderEnabled && (
                <div className={`${ROW} ${FOCUS}`}>
                  <span className="min-w-0 flex-1 px-1 py-1 transition-all duration-200 ease-in-out">
                    <span className={`${TITLE} block`}>Reminder time</span>
                    <span className={`${HELP} block mt-0.5`}>
                      When the daily check-in arrives
                    </span>
                  </span>
                  <div className="relative flex shrink-0 items-center">
                    <input
                      ref={timeInputRef}
                      type="time"
                      value={reminderTime}
                      onChange={handleTimeChange}
                      className="sr-only"
                      id="time-picker-input"
                    />
                    <button
                      type="button"
                      onClick={handleOpenTimePicker}
                      aria-label={`Reminder time, currently ${formatDisplayTime(reminderTime)}`}
                      className="min-h-[40px] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md px-4 text-sm font-bold tracking-wide tabular-nums text-white drop-shadow-md shadow-xl transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-white/15 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {formatDisplayTime(reminderTime)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Feedback"
            summary={isHapticsOn ? 'On' : 'Off'}
            open={openSection === 'feedback'}
            onToggle={() => toggleSection('feedback')}
          >
            <div className={CARD}>
              <button
                type="button"
                role="switch"
                aria-checked={isHapticsOn}
                onClick={handleToggleHaptics}
                className={`${ROW} ${FOCUS} hover:bg-white/5 active:bg-white/10 rounded-2xl`}
              >
                <span className="min-w-0 flex-1 px-1 py-1 transition-all duration-200 ease-in-out">
                  <span className={`${TITLE} block`}>Haptic feedback</span>
                  <span className={`${HELP} block mt-0.5`}>
                    {isHapticsOn ? 'Vibration on taps' : 'Silent'}
                  </span>
                </span>
                <Switch on={isHapticsOn} />
              </button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Danger zone"
            open={openSection === 'danger'}
            onToggle={() => toggleSection('danger')}
          >
            <div className="transition-all duration-200 ease-in-out">
              <button
                type="button"
                onClick={() => {
                  tapLight();
                  setShowConfirmReset(true);
                }}
                className={`${ROW} ${FOCUS} hover:-translate-y-1 hover:bg-white/15 active:bg-white/20 active:scale-95 transition-all duration-200 ease-in-out rounded-2xl`}
              >
                <span className="min-w-0 flex-1 px-1 py-1 transition-all duration-200 ease-in-out">
                  <span className="text-[15px] font-extrabold leading-relaxed tracking-wide text-fixed-white drop-shadow-md block">
                    Reset all data
                  </span>
                  <span className={`${HELP} block mt-0.5`}>
                    Erases every habit, mark and setting
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-zinc-400">
                  &rsaquo;
                </span>
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Logo studio modal */}
      {logoOpen && (
        <Suspense fallback={null}>
          <LogoSettingsModal
            logo={logoSettings}
            onUpdateLogo={handleUpdateLogo}
            onClose={closeLogoModal}
          />
        </Suspense>
      )}

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div
          className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <div className="bg-gray-900/25 backdrop-blur-xl w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3 animate-fade-in">
            <h3 id="reset-title" className="px-1 text-base font-extrabold tracking-wide text-white drop-shadow-md leading-relaxed transition-all duration-200 ease-in-out">
              Reset all data?
            </h3>
            <p className={`${HELP} mt-2 px-1`}>
              This permanently erases all your habits, calendar marks and settings. It
              can&rsquo;t be undone.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="min-h-[44px] rounded-full px-5 text-sm font-semibold text-gray-100 bg-white/10 backdrop-blur-md shadow-xl cursor-pointer hover:scale-110 hover:-translate-y-1 hover:bg-white/20 active:scale-95 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                className="min-h-[44px] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg px-5 text-sm font-bold tracking-wide text-zinc-100 drop-shadow-md shadow-xl shadow-white/20 cursor-pointer hover:-translate-y-1 hover:bg-white/20 active:scale-95 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};