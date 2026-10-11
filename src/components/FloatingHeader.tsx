import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { tapLight } from '../services/haptics';
import { Wordmark } from './Wordmark';
import type { LogoSettings } from '../types/habit';

interface FloatingHeaderProps {
  title: string;
  isRootScreen?: boolean;
  onNavigateBack?: () => void;
  logo?: LogoSettings;
}

/* Floating title + back button over content — no container, no menu.
   Primary navigation lives in the bottom bar. Memoized: props change only on
   navigation or logo edits, never on clocks. */
export const FloatingHeader: React.FC<FloatingHeaderProps> = React.memo(({
  title,
  isRootScreen = true,
  onNavigateBack,
  logo,
}) => {
  return (
    <div
      className="floating-header pointer-events-none absolute top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-2 select-none"
      onPointerDownCapture={() => tapLight()}
    >
      {/* Sub-screens get a solid blurred bar so scrolling content passes cleanly
          under the title/back button instead of colliding with it. The Home
          screen keeps its fully transparent, floating look by design. */}
      {!isRootScreen && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[#0F172A]/90 backdrop-blur-md"
        />
      )}

      <div className="flex min-w-0 items-center gap-1 pointer-events-auto">
        {!isRootScreen && onNavigateBack && (
          <button
            onClick={onNavigateBack}
            aria-label="Back"
            className="-ml-2 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 backdrop-blur-md shadow-xl text-gray-200 transition-all duration-200 ease-in-out hover:scale-110 hover:-translate-y-1 hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex min-w-0 items-center">
          {title === 'Momentum' ? (
            <Wordmark logo={logo} />
          ) : (
            <h1 className="truncate px-1 text-2xl font-extrabold tracking-wide text-fixed-white drop-shadow-md transition-all duration-200 ease-in-out">{title}</h1>
          )}
        </div>
      </div>
    </div>
  );
});
