'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import FloatingSocialButtons from './FloatingSocialButtons';
import { PortalShellExtras } from './PortalShellExtras';

export const PortalLayoutChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = Boolean(pathname && pathname.startsWith('/admin'));

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-white">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 pb-8 flex-1 bg-white">
        {children}
      </main>
      <Footer />
      <FloatingSocialButtons />
      <PortalShellExtras />
    </div>
  );
};

export default PortalLayoutChrome;
