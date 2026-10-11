import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { tapLight } from '../services/haptics';
import { Wordmark, LOGO_FONTS, ensureLogoFont } from './Wordmark';
import type { LogoSettings } from '../types/habit';
import {
  DEFAULT_LOGO,
  LOGO_WEIGHTS,
  MIN_LOGO_SIZE,
  MAX_LOGO_SIZE,
} from '../types/habit';

interface LogoSettingsModalProps {
  logo: LogoSettings;
  onUpdateLogo: (patch: Partial<LogoSettings>) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#ffffff',
  '#2dd4bf',
  '#38bdf8',
  '#a78bfa',
  '#f472b6',
  '#fbbf24',
  '#34d399',
  '#fb7185',
];

const WEIGHT_LABELS: Record<number, string> = {
  400: 'R',
  500: 'M',
  700: 'B',
  900: 'Black',
};

/**
 * Compact logo studio modal. Writes straight through to the saved settings,
 * so the header logo updates live. Traps focus, closes on backdrop / Escape /
 * close FAB, and returns focus to the caller on close.
 */
export const LogoSettingsModal: React.FC<LogoSettingsModalProps> = ({
  logo,
  onUpdateLogo,
  onClose,
}) => {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [gradientOpen, setGradientOpen] = useState(logo.gradient);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Lock the page behind the modal while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setGradientOpen(logo.gradient);
  }, [logo.gradient]);

  const pick = (patch: Partial<LogoSettings>) => {
    tapLight();
    if (patch.fontFamily) ensureLogoFont(patch.fontFamily);
    onUpdateLogo(patch);
  };

  const onCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const root = cardRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const swatchVisual = (value: string, selected: boolean) => (
    <span
      aria-hidden="true"
      style={{ backgroundColor: value }}
      className={`block h-7 w-7 rounded-full shadow-xl transition-all duration-200 ease-in-out ${
        selected ? 'ring-2 ring-white scale-110' : ''
      }`}
    />
  );

  const isCustomColor =
    !COLOR_PRESETS.includes(logo.color.toLowerCase()) ||
    (logo.gradient && !COLOR_PRESETS.includes(logo.color2.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      aria-hidden={false}
    >
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Logo settings"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onCardKeyDown}
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[80vh] w-full max-w-[340px] flex-col gap-3 overflow-hidden rounded-3xl bg-[#0B1120]/85 p-4 shadow-2xl backdrop-blur-xl border border-white/15"
      >
        {/* Title + reset + close */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate px-1 text-sm font-bold tracking-wider text-white drop-shadow-md">
            Logo
          </span>
          <button
            type="button"
            onClick={() => pick({ ...DEFAULT_LOGO })}
            aria-label="Reset logo to defaults"
            title="Reset to defaults"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md text-gray-100 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close logo settings"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 shadow-xl backdrop-blur-md border border-white/20 text-gray-100 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body scrolls; backdrop page never does */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 pb-1">
            {/* Live preview */}
            <div
              className="flex h-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5"
              aria-label="Logo preview"
            >
              <Wordmark logo={logo} />
            </div>

            {/* Color: one scrollable row, 28px visuals on 44px targets */}
            <div
              className="flex gap-1 overflow-x-auto overscroll-contain pb-1"
              role="group"
              aria-label="Logo color"
            >
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pick({ color: c, gradient: false })}
                  aria-label={`Color ${c}`}
                  aria-pressed={!logo.gradient && logo.color.toLowerCase() === c}
                  title={`Color ${c}`}
                  className="shrink-0 cursor-pointer p-2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full"
                >
                  {swatchVisual(c, !logo.gradient && logo.color.toLowerCase() === c)}
                </button>
              ))}
              <label
                className="relative shrink-0 cursor-pointer p-2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full"
                title="Custom color"
              >
                <span
                  aria-hidden="true"
                  className={`block h-7 w-7 rounded-full shadow-xl transition-all duration-200 ease-in-out ${
                    isCustomColor ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{
                    background:
                      'conic-gradient(#f87171, #fbbf24, #a3e635, #34d399, #38bdf8, #a78bfa, #f87171)',
                  }}
                />
                <span className="sr-only">Custom logo color</span>
                <input
                  type="color"
                  value={logo.color}
                  onChange={(e) => pick({ color: e.target.value, gradient: false })}
                  aria-label="Custom logo color"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>

            {/* Gradient toggle + collapsible second row */}
            <div>
              <button
                type="button"
                role="switch"
                aria-checked={logo.gradient}
                onClick={() => pick({ gradient: !logo.gradient })}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-1 py-2 text-left transition-all duration-200 ease-in-out hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <span className="min-w-0 flex-1 text-[13px] font-bold tracking-wider text-white drop-shadow-md">
                  Gradient
                </span>
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 backdrop-blur-md shadow-xl transition-all duration-200 ease-in-out ${
                    logo.gradient ? 'bg-white shadow-white/25' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full shadow-lg transition-all duration-200 ${
                      logo.gradient ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-white'
                    }`}
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {logo.gradient && (
                  <motion.div
                    key="color2"
                    initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex gap-1 overflow-x-auto overscroll-contain pb-1 pt-1"
                      role="group"
                      aria-label="Gradient end color"
                    >
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => pick({ color2: c })}
                          aria-label={`Gradient to ${c}`}
                          aria-pressed={logo.color2.toLowerCase() === c}
                          title={`Gradient to ${c}`}
                          className="shrink-0 cursor-pointer p-2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full"
                        >
                          {swatchVisual(c, logo.color2.toLowerCase() === c)}
                        </button>
                      ))}
                      <label
                        className="relative shrink-0 cursor-pointer p-2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full"
                        title="Custom gradient color"
                      >
                        <span
                          aria-hidden="true"
                          className="block h-7 w-7 rounded-full shadow-xl"
                          style={{
                            background:
                              'conic-gradient(#38bdf8, #a78bfa, #f472b6, #fbbf24, #38bdf8)',
                          }}
                        />
                        <span className="sr-only">Custom gradient end color</span>
                        <input
                          type="color"
                          value={logo.color2}
                          onChange={(e) => pick({ color2: e.target.value })}
                          aria-label="Custom gradient end color"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center gap-2 px-1">
                <span className="min-w-0 flex-1 text-[13px] font-bold tracking-wider text-white drop-shadow-md">
                  Size
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-zinc-100 shadow-sm backdrop-blur-sm">
                  {logo.size}px
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={40}
                step={1}
                value={logo.size}
                onChange={(e) => pick({ size: Number(e.target.value) })}
                aria-label={`Logo size ${logo.size} pixels`}
                className="glass-slider mt-1 w-full cursor-pointer appearance-none rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{ height: 6 }}
              />
            </div>

            {/* Font chips */}
            <div
              className="flex gap-2 overflow-x-auto overscroll-contain pb-1"
              role="group"
              aria-label="Logo font"
            >
              {LOGO_FONTS.map((f) => {
                const selected = logo.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => pick({ fontFamily: f.id })}
                    aria-pressed={selected}
                    className={`h-11 shrink-0 rounded-2xl bg-white/5 px-3 backdrop-blur-md cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                      selected ? 'ring-2 ring-white bg-white/10 shadow-xl' : 'shadow-md'
                    }`}
                  >
                    <span className="text-base leading-none text-white" style={{ fontFamily: f.stack }}>
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Weight segmented pill */}
            <div
              className="flex gap-1 rounded-full bg-white/5 p-1 backdrop-blur-md"
              role="group"
              aria-label="Logo weight"
            >
              {LOGO_WEIGHTS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => pick({ fontWeight: w })}
                  aria-pressed={logo.fontWeight === w}
                  className={`h-11 min-w-0 flex-1 rounded-full text-xs backdrop-blur-md cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    logo.fontWeight === w
                      ? 'bg-white text-zinc-950 font-bold shadow-xl'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  style={{ fontWeight: w }}
                >
                  {w === 400 ? 'R' : w === 500 ? 'M' : w === 700 ? 'B' : 'Black'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
