'use client';

import React, { lazy, Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  LayoutDashboard,
  FilePlus2,
  Clock,
  AlertTriangle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePortal } from '@/context/PortalContext';

const UrlIndexationModal = lazy(() =>
  import('../UrlIndexationModal').then((m) => ({ default: m.UrlIndexationModal }))
);

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAdmin, loginWithPasscode, logout } = useAuth();
  const {
    lang,
    vacancies,
    toastMessage,
    showToast,
    isUrlIndexationOpen,
    setIsUrlIndexationOpen,
  } = usePortal();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/posts/new', label: 'Post Builder', icon: FilePlus2, exact: false },
    { href: '/admin?filter=expiring', label: 'Expiring Soon', icon: Clock, exact: false },
    { href: '/admin?filter=seo', label: 'Incomplete SEO', icon: AlertTriangle, exact: false },
  ];

  const isPostBuilder = pathname?.startsWith('/admin/posts');
  const breadcrumbLabel = isPostBuilder ? 'Post Builder' : 'Dashboard';

  const handlePasscodeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!passcode.trim()) {
      setLoginError('Please enter admin passcode.');
      return;
    }

    setSigningIn(true);
    try {
      const res = await loginWithPasscode(passcode.trim());
      if (res.ok) {
        setPasscode('');
        return;
      }
      setLoginError(
        res.error || 'Invalid admin passcode. Use verified Google Admin Sign-In for full cloud sync.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const renderSidebarContent = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full bg-white text-neutral-900">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-neutral-200 shrink-0">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-sm font-bold tracking-tight text-neutral-900 whitespace-nowrap no-underline"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Rajasthan Vacancy Admin
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Nav */}
      <nav aria-label="Admin Navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === '/admin'
            : item.href === '/admin/posts/new' && Boolean(pathname?.startsWith('/admin/posts'));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap no-underline ${
                active
                  ? 'bg-emerald-50 text-[#15803d] font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-neutral-200 space-y-1">
          <button
            type="button"
            onClick={() => {
              setIsUrlIndexationOpen(true);
              if (onNavigate) onNavigate();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors whitespace-nowrap cursor-pointer text-left"
          >
            <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>URL Inspection</span>
          </button>

          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors whitespace-nowrap no-underline"
          >
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Public Portal</span>
          </Link>
        </div>
      </nav>

      {/* Admin Sign Out Footer */}
      <div className="p-4 border-t border-neutral-200 space-y-3 shrink-0">

        <button
          type="button"
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Auth Gate for unauthenticated visitors to /admin
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-neutral-50 flex items-center justify-center p-4"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif" }}
      >
        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803d]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>सुरक्षित एडमिन डैशबोर्ड (Protected Admin Panel)</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Rajasthan Vacancy Admin (/admin)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              नई पोस्ट जोड़ने, एडिट/डिलीट करने और JSON/Markdown जनरेट करने के लिए अपना एडमिन पासवर्ड/पिन दर्ज करें।
            </p>
          </div>

          <form onSubmit={handlePasscodeSignIn} className="space-y-3">
            <div>
              <label htmlFor="admin-passcode-input" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                एडमिन पासवर्ड / पिन (Admin Password / PIN from .env)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-passcode-input"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setLoginError('');
                  }}
                  placeholder=".env में सेट किया गया पासवर्ड/पिन डालें"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                Set via .env: ADMIN_PANEL_PASSCODE / ADMIN_PASSWORD / ADMIN_PIN
              </p>
            </div>
            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-2.5 px-4 rounded-lg bg-[#15803d] hover:bg-[#166534] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {signingIn ? 'जाँच हो रही है...' : 'पासवर्ड / पिन से लॉगिन करें (Unlock Admin)'}
            </button>
          </form>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800 leading-relaxed">
              <p>{loginError}</p>
            </div>
          )}

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-900 hover:underline no-underline text-neutral-600">
              ← मुख्य वेबसाइट पर वापस जाएँ (Back to Portal)
            </Link>
            <span>noindex protected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 text-neutral-900 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Desktop Fixed Sidebar (256px) */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-neutral-200 bg-white sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Slide-Over Sheet Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-neutral-900/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 max-w-[85vw] h-full bg-white border-r border-neutral-200 z-10"
            >
              {renderSidebarContent(() => setDrawerOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean 1-Row Top Bar (Breadcrumb left, 1 Primary Action right) */}
        <header className="h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
              <Link
                href="/admin"
                className="text-neutral-500 hover:text-neutral-900 whitespace-nowrap no-underline hidden sm:inline"
              >
                Admin
              </Link>
              <span aria-hidden="true" className="text-neutral-300 hidden sm:inline">/</span>
              <span className="font-semibold text-neutral-900 truncate">{breadcrumbLabel}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isPostBuilder ? (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold whitespace-nowrap shrink-0 no-underline transition-colors"
              >
                All Posts
              </Link>
            ) : (
              <Link
                href="/admin/posts/new"
                className="px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 no-underline transition-colors"
              >
                <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>New Post</span>
              </Link>
            )}
          </div>
        </header>

        {/* Viewport Workspace */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      {/* Live Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 right-4 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-lg text-xs font-medium border border-neutral-700 shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      {/* URL Inspection & Instant Indexing Modal */}
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
    </div>
  );
};

export default AdminShell;
