'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BellRing, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { usePortal } from '../context/PortalContext';
import { getCategoryDisplayLabel } from '../utils/jobAlertEngine';

export const LiveNotificationToast: React.FC = () => {
  const { lang } = usePortal();
  const { liveToastAlert, dismissLiveToastAlert, openNotificationVacancy } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);
  const isHi = lang === 'hi';

  useEffect(() => {
    if (!liveToastAlert || isHovered) return;
    const timer = window.setTimeout(() => {
      dismissLiveToastAlert();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [liveToastAlert, isHovered, dismissLiveToastAlert]);

  return (
    <AnimatePresence>
      {liveToastAlert && (
        <motion.aside
          key={liveToastAlert.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803d]">
              <BellRing className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {liveToastAlert.kind === 'status_update'
                  ? isHi
                    ? 'भर्ती स्थिति अपडेट'
                    : 'Job Status Update'
                  : isHi
                    ? 'नई भर्ती अलर्ट'
                    : 'New Matching Job'}
              </span>
            </div>
            <button
              type="button"
              onClick={dismissLiveToastAlert}
              aria-label={isHi ? 'बंद करें' : 'Dismiss notification'}
              className="p-1 -mr-1 -mt-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
            {isHi ? liveToastAlert.titleHi || liveToastAlert.title : liveToastAlert.title}
          </p>

          <div className="mt-1.5 flex items-center flex-wrap gap-1.5 text-xs text-slate-600">
            <span>{liveToastAlert.organization}</span>
            <span aria-hidden="true">·</span>
            <span>{getCategoryDisplayLabel(liveToastAlert.category, isHi)}</span>
            {liveToastAlert.totalPosts ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {liveToastAlert.totalPosts} {isHi ? 'पद' : 'Posts'}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 truncate">
              {liveToastAlert.matchedAlertName}
            </span>
            <button
              type="button"
              onClick={() => openNotificationVacancy(liveToastAlert)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <span>{isHi ? 'विवरण देखें' : 'View Job'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default LiveNotificationToast;
