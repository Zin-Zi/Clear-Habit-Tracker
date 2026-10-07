import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ArrowLeft } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  isRootScreen?: boolean;
  onNavigateBack?: () => void;
  onNavigateToStats: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAbout: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  isRootScreen = true,
  onNavigateBack,
  onNavigateToStats,
  onNavigateToSettings,
  onNavigateToAbout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        {!isRootScreen && onNavigateBack && (
          <button
            onClick={onNavigateBack}
            aria-label="Back"
            className="p-1 -ml-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-extrabold tracking-tight animate-text-shimmer">
          {title}
        </h1>
      </div>

      {/* 3-Dot Overflow Menu */}
      {isRootScreen && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Options Menu"
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToStats();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white text-left transition-colors"
              >
                Stats
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToSettings();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white text-left transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToAbout();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white text-left transition-colors"
              >
                About
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
