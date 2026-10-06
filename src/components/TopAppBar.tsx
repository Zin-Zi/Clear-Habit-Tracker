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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        {!isRootScreen && onNavigateBack && (
          <button
            onClick={onNavigateBack}
            aria-label="Back"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* 3-Dot Overflow Menu in dark gray */}
      {isRootScreen && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Options Menu"
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToStats();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left transition-colors"
              >
                Stats
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToSettings();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateToAbout();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left transition-colors"
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
