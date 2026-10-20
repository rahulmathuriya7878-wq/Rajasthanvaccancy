import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { LanguageMode } from '../types';

interface OfflineIndicatorProps {
  lang: LanguageMode;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isHi = lang === 'hi';
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {isHi 
          ? 'आप ऑफ़लाइन हैं — कैश्ड जॉब पोस्ट्स और विवरण उपलब्ध हैं।' 
          : 'Offline Mode — Viewing cached job details.'}
      </span>
    </div>
  );
};
