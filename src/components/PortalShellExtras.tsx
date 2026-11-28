'use client';

import React, { lazy, Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { OfflineIndicator } from './OfflineIndicator';

const AdminLoginModal = lazy(() =>
  import('./AdminLoginModal').then((m) => ({ default: m.AdminLoginModal }))
);
const UrlIndexationModal = lazy(() =>
  import('./UrlIndexationModal').then((m) => ({ default: m.UrlIndexationModal }))
);

export const PortalShellExtras: React.FC = () => {
  const {
    lang,
    vacancies,
    toastMessage,
    isAdminLoginOpen,
    setIsAdminLoginOpen,
    isUrlIndexationOpen,
    setIsUrlIndexationOpen,
  } = usePortal();

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isAdminLoginOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            lang={lang}
            onOpenUrlIndexation={() => {
              setIsAdminLoginOpen(false);
              setIsUrlIndexationOpen(true);
            }}
          />
        </Suspense>
      )}

      {isUrlIndexationOpen && (
        <Suspense fallback={null}>
          <UrlIndexationModal
            isOpen={isUrlIndexationOpen}
            onClose={() => setIsUrlIndexationOpen(false)}
            lang={lang}
            vacancies={vacancies}
          />
        </Suspense>
      )}

      <OfflineIndicator lang={lang} />
    </>
  );
};

export default PortalShellExtras;
