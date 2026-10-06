import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white text-gray-700 text-xs px-4 py-1.5 flex items-center justify-between select-none z-50 border-b border-gray-100">
      <div className="font-semibold tracking-wide text-gray-900 text-[11px]">
        {timeStr || '09:41'}
      </div>
      <div className="flex items-center gap-1.5 text-gray-600">
        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.5 rounded">
          OFFLINE
        </span>
        <Signal className="w-3.5 h-3.5 text-gray-600" />
        <Wifi className="w-3.5 h-3.5 text-gray-600" />
        <BatteryMedium className="w-4 h-4 text-gray-700" />
      </div>
    </div>
  );
};
