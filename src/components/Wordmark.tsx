import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import type { LogoSettings } from '../types/habit';
import { DEFAULT_LOGO, MAX_LOGO_DISPLAY_SIZE } from '../types/habit';

const LOGO_TEXT = 'Momentum';
/* Shared by the invisible reserve and the typed layer so both measure
   identically. Size/weight/family come from the logo settings via style. */
const WORD_CLASSES = 'whitespace-nowrap tracking-[-0.02em]';

/* Typewriter pacing. */
const START_DELAY_MS = 150;
const TYPE_MS = 80;
const HOLD_MS = 3000;
const DELETE_MS = 65;
const RESTART_DELAY_MS = 500;

export interface LogoFontOption {
  id: string;
  label: string;
  /** Full stack (loaded family first, platform fallbacks after). */
  stack: string;
  /** Google Fonts stylesheet, injected on demand; null = already bundled. */
  href: string | null;
  /** Rounded / display faces read better slightly tighter. */
  tracking: string;
}

/**
 * Selectable logo faces. Only Sora ships in index.html; the rest load lazily
 * through ensureLogoFont the first time they are picked (or rendered), so
 * offline users always fall back to the platform stack below.
 */
export const LOGO_FONTS: LogoFontOption[] = [
  {
    id: 'sora',
    label: 'Sora',
    stack: "'Sora', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    href: null,
    tracking: '-0.02em',
  },
  {
    id: 'outfit',
    label: 'Outfit',
    stack: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap',
    tracking: '-0.01em',
  },
  {
    id: 'grotesk',
    label: 'Space Grotesk',
    stack: "'Space Grotesk', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap',
    tracking: '0em',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    stack: "'Playfair Display', Georgia, 'Times New Roman', serif",
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700;900&display=swap',
    tracking: '0em',
  },
  {
    id: 'jetbrains',
    label: 'JetBrains Mono',
    stack: "'JetBrains Mono', 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap',
    tracking: '0em',
  },
  {
    id: 'fredoka',
    label: 'Fredoka',
    stack: "'Fredoka', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap',
    tracking: '0.01em',
  },
];

/** Injects a logo face stylesheet once; no-op offline, bundled, or repeated. */
export function ensureLogoFont(id: string): void {
  if (typeof document === 'undefined') return;
  const opt = LOGO_FONTS.find((f) => f.id === id);
  if (!opt?.href || document.querySelector(`link[data-logo-font="${id}"]`)) return;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = opt.href;
    link.dataset.logoFont = id;
    document.head.appendChild(link);
  } catch {
    // Non-DOM environment — fallbacks already cover rendering.
  }
}

function logoFontOf(id: string): LogoFontOption {
  return LOGO_FONTS.find((f) => f.id === id) ?? LOGO_FONTS[0];
}

/**
 * The Momentum wordmark. Shared by the header, the splash, and the logo
 * settings preview so the three can never drift apart. Rendered as live text
 * (not an image) so it stays crisp at any size and remains accessible.
 *
 * Typewriter reveal: letters appear one by one by slicing LOGO_TEXT at the
 * visible index (M, Mo, Mom, …). After a 3s hold the word backspaces away and
 * types again in a loop. An invisible copy of the full word reserves the
 * final width upfront (same grid cell, same font/size/weight), so the PRO
 * badge never shifts while typing.
 */
export const Wordmark: React.FC<{
  showPro?: boolean;
  className?: string;
  logo?: LogoSettings;
}> = ({ showPro = true, className = '', logo = DEFAULT_LOGO }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    ensureLogoFont(logo.fontFamily);
  }, [logo.fontFamily]);

  useEffect(() => {
    // Respect reduced motion: show the full word immediately, no typing.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisibleCount(LOGO_TEXT.length);
      return;
    }
    // Local mutable cursor: each effect run owns a fresh one, so React
    // StrictMode's mount → cleanup → remount restarts cleanly with no
    // duplicated or skipped letters. Plain values (never updater side
    // effects) keep every setState idempotent.
    let cancelled = false;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(t);
    };
    const tickErase = () => {
      i -= 1;
      setVisibleCount(i);
      if (i > 0) later(tickErase, DELETE_MS);
      else later(tickType, RESTART_DELAY_MS);
    };
    const tickType = () => {
      i += 1;
      setVisibleCount(i);
      if (i < LOGO_TEXT.length) later(tickType, TYPE_MS);
      else later(tickErase, HOLD_MS);
    };
    setVisibleCount(0);
    later(tickType, START_DELAY_MS);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const typed = LOGO_TEXT.slice(0, visibleCount);
  const font = logoFontOf(logo.fontFamily);
  const displaySize = Math.min(logo.size, MAX_LOGO_DISPLAY_SIZE);
  const paint: React.CSSProperties = logo.gradient
    ? {
        backgroundImage: `linear-gradient(90deg, ${logo.color}, ${logo.color2})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }
    : { color: logo.color };

  return (
    <span
      className={`group flex cursor-default items-center gap-2.5 transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      aria-label="Momentum"
    >
      {/* Wordmark typewriter in the user's face, size, weight, and paint. */}
      <span
        className="relative grid select-none drop-shadow-[0_0_18px_rgba(255,255,255,0.35)] transition-[filter] duration-200 group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]"
        style={{ fontFamily: font.stack }}
      >
        {/* Invisible full word: locks the final width from the first frame. */}
        <span
          aria-hidden="true"
          className={`invisible col-start-1 row-start-1 ${WORD_CLASSES}`}
          style={{ fontSize: displaySize, fontWeight: logo.fontWeight, letterSpacing: font.tracking }}
        >
          {LOGO_TEXT}
        </span>
        {/* Typed layer stacked in the same cell — grows without moving kin.
            Single text rendering only: no overlay copy, so overlap is
            impossible by construction. */}
        <span
          aria-hidden="true"
          className={`col-start-1 row-start-1 flex items-center ${WORD_CLASSES}`}
          style={{ fontSize: displaySize, fontWeight: logo.fontWeight, letterSpacing: font.tracking }}
        >
          <span style={paint}>{typed}</span>
          <span
            className="wordmark-caret ml-1.5 inline-block h-[0.85em] w-[2px] rounded-full"
            style={{
              background: logo.gradient
                ? `linear-gradient(180deg, ${logo.color}, ${logo.color2})`
                : logo.color,
            }}
          />
        </span>
        {/* PRO badge as a trademark superscript: pinned to the top-right of the
            reserved word box, so typing never nudges it. */}
        {showPro && (
          <span
            className="absolute left-full top-0 ml-1.5 -translate-y-1/4 rounded-full bg-gradient-to-r from-zinc-200 to-zinc-500 p-px shadow-lg"
            aria-label="Pro plan"
          >
            <span className="pro-shimmer flex items-center gap-0.5 rounded-full bg-[#0B1120]/85 px-1 py-px backdrop-blur-md">
              <Crown className="h-2 w-2 shrink-0 text-zinc-100" aria-hidden="true" />
              <span className="text-[8px] font-bold tracking-widest text-white">PRO</span>
            </span>
          </span>
        )}
      </span>
    </span>
  );
};
