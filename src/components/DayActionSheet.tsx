import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, Undo2, X, CalendarDays } from 'lucide-react';
import { DailyStatus } from '../types/habit';
import { tapLight } from '../services/haptics';

interface DayActionSheetProps {
  open: boolean;
  /** Formatted label for the tapped day, e.g. "Thu, 8 October". */
  dateLabel: string;
  current: DailyStatus;
  onSelect: (status: DailyStatus) => void;
  onClose: () => void;
}

const OPTIONS: Array<{
  status: DailyStatus;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Drives the pill colour through CSS `color-mix` (see .day-mark-action). */
  accent: string;
}> = [
  {
    status: 'done',
    label: 'Mark Done',
    hint: 'Kept this day',
    icon: Check,
    accent: '#fafafa',
  },
  {
    status: 'skipped',
    label: 'Skip',
    hint: 'Rested',
    icon: Minus,
    accent: '#a1a1aa',
  },
  {
    status: 'unmarked',
    label: 'Undo',
    hint: 'Clear day',
    icon: Undo2,
    accent: '#71717a',
  },
];

/**
 * Compact floating glass pop-up for marking one calendar day.
 *
 * The overlay is `absolute`, not `fixed`: this component renders inside the
 * screen container, which is `position: relative` but also `overflow: hidden`.
 * A `fixed` overlay there is clipped by that container, so anchoring to the
 * container keeps the dialog correctly centred on the app frame both on device
 * and in the desktop phone-frame preview.
 *
 * Animates only transform/opacity, so it stays smooth on Android WebView.
 */
export const DayActionSheet: React.FC<DayActionSheetProps> = ({
  open,
  dateLabel,
  current,
  onSelect,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && (
        /* Single child of AnimatePresence so its exit animation always runs. */
        <>
          {/* Scrim + centering layer — tap anywhere outside the card to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              /* Pop-in: starts slightly small and transparent, settles to 1. */
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={`Mark ${dateLabel}`}
              onClick={(e) => e.stopPropagation()}
              /* max-h + overflow-y-auto keeps every button reachable on very
                 short screens without the card ever being clipped. */
              className="day-mark-glass w-full max-w-[280px] max-h-[85%] overflow-y-auto rounded-2xl p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-zinc-100">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                      Daily Mark
                    </span>
                  </div>
                  <h3 className="premium-title mt-0.5 text-sm leading-tight text-slate-100">
                    {dateLabel}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 active:bg-white/15"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = current === opt.status;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => {
                        tapLight();
                        onSelect(opt.status);
                      }}
                      aria-pressed={active}
                      style={{ ['--accent' as string]: opt.accent }}
                      className={`day-mark-action flex w-full items-center gap-2.5 rounded-full border px-3 py-2.5 text-left transition-colors active:scale-[0.98] ${
                        active ? 'is-active' : ''
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/25">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold leading-tight">
                          {opt.label}
                        </span>
                        <span className="block text-[10px] leading-tight text-slate-400">
                          {opt.hint}
                        </span>
                      </span>
                      {active && (
                        <span className="shrink-0 rounded-full bg-black/25 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                          Now
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};