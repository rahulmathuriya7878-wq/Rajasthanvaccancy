'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

const AUTHORIZED_ADMIN_EMAIL = 'rahulmathuriya7878@gmail.com';

export interface GoogleSignInResult {
  ok: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isCloudAdmin: boolean;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  loginWithPasscode: (passcode: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleAdminMode: (enabled?: boolean) => void;
  getAdminAuthHeaders: () => Promise<Record<string, string>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isCloudAdmin: false,
  signInWithGoogle: async () => ({ ok: false }),
  loginWithPasscode: async () => ({ ok: false }),
  logout: async () => {},
  toggleAdminMode: () => {},
  getAdminAuthHeaders: async () => ({ 'X-Requested-With': 'XMLHttpRequest' }),
});

function isAuthorizedAdminUser(u: User | null): boolean {
  if (!u || !u.email) return false;
  return u.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}

async function exchangeAdminSessionCookie(u: User): Promise<void> {
  if (!isAuthorizedAdminUser(u)) return;
  try {
    const idToken = await u.getIdToken();
    await fetch('/api/admin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // Non-blocking fallback
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(false);
  const [shouldHydrateFirebaseAuth, setShouldHydrateFirebaseAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Hydrate admin flag from localStorage after mount & check redirect result
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('raj_admin_active_v1') === 'true';
      if (storedAdmin) {
        setIsAdminState(true);
        setShouldHydrateFirebaseAuth(true);
        setLoading(true);
      }
    } catch {}

    // Check redirect result for mobile / redirect sign in flow
    (async () => {
      try {
        const [{ getRedirectResult, signOut }, { auth }, { syncUserProfileToFirestore }] = await Promise.all([
          import('firebase/auth'),
          import('../lib/firebase'),
          import('../services/firebaseUserService'),
        ]);
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (isAuthorizedAdminUser(result.user)) {
            setUser(result.user);
            setShouldHydrateFirebaseAuth(true);
            setIsAdminState(true);
            try {
              localStorage.setItem('raj_admin_active_v1', 'true');
            } catch {}
            void exchangeAdminSessionCookie(result.user);
            void syncUserProfileToFirestore(result.user);
          } else {
            await signOut(auth).catch(() => {});
          }
        }
      } catch {}
    })();
  }, []);

  // Hydrate Firebase Auth session whenever admin mode is active
  useEffect(() => {
    if (!shouldHydrateFirebaseAuth && !isAdminState) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const [{ onAuthStateChanged, signOut }, { auth }, { syncUserProfileToFirestore }] = await Promise.all([
          import('firebase/auth'),
          import('../lib/firebase'),
          import('../services/firebaseUserService'),
        ]);
        if (!isMounted) return;

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!isMounted) return;
          if (currentUser && !isAuthorizedAdminUser(currentUser)) {
            await signOut(auth).catch(() => {});
            setUser(null);
            setIsAdminState(false);
            setLoading(false);
            return;
          }

          setUser(currentUser);
          setLoading(false);

          if (currentUser && isAuthorizedAdminUser(currentUser)) {
            setIsAdminState(true);
            try {
              localStorage.setItem('raj_admin_active_v1', 'true');
            } catch {}
            void exchangeAdminSessionCookie(currentUser);
            void syncUserProfileToFirestore(currentUser);
          }
        });
      } catch {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [shouldHydrateFirebaseAuth]);

  const toggleAdminMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isAdminState;
    setIsAdminState(nextState);
    if (nextState) setShouldHydrateFirebaseAuth(true);
    try {
      localStorage.setItem('raj_admin_active_v1', nextState ? 'true' : 'false');
    } catch {}
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    try {
      const [{ signInWithPopup, signInWithRedirect, signOut }, { auth, googleAuthProvider }, { syncUserProfileToFirestore }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
        import('../services/firebaseUserService'),
      ]);
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      try {
        const result = await signInWithPopup(auth, googleAuthProvider);
        if (result.user) {
          if (!isAuthorizedAdminUser(result.user)) {
            await signOut(auth).catch(() => {});
            return { ok: false, error: 'यह Google अकाउंट एडमिन एक्सेस के लिए अधिकृत नहीं है।' };
          }
          setUser(result.user);
          setShouldHydrateFirebaseAuth(true);
          setIsAdminState(true);
          try {
            localStorage.setItem('raj_admin_active_v1', 'true');
          } catch {}
          await exchangeAdminSessionCookie(result.user);
          void syncUserProfileToFirestore(result.user);
          return { ok: true, user: result.user };
        }
      } catch (popupErr: any) {
        const code = popupErr?.code || '';
        // Only fall back to redirect when popup is blocked on a top-level window (never inside an iframe or on user close)
        if (code === 'auth/popup-blocked' && !isInIframe) {
          await signInWithRedirect(auth, googleAuthProvider);
          return { ok: true };
        }
        throw popupErr;
      }
      return { ok: false, error: 'Google sign-in did not complete.' };
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const code = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'rajasthanvacancy.online';
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      const msg =
        code === 'auth/unauthorized-domain'
          ? `Domain "${currentHost}" is not in Firebase Authorized Domains. Add it in Firebase Console or open via https://ais-pre-xr5evgohw4ejjzuf775vak-300878841095.asia-southeast1.run.app.`
          : code === 'auth/popup-blocked'
            ? isInIframe
              ? 'Browser blocked the Google sign-in popup inside the preview frame. Allow popups or open Admin in a new tab.'
              : 'Browser blocked the Google sign-in popup. Please allow popups and try again.'
            : code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
              ? 'Google sign-in popup was closed before completing login. Please try again.'
              : code === 'auth/operation-not-allowed'
                ? 'Google Sign-In is disabled in Firebase Authentication settings.'
                : err?.message || 'Google sign-in failed.';
      return { ok: false, error: msg };
    }
  };

  const loginWithPasscode = async (passcode: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmed = passcode.trim();
    if (!trimmed) {
      return { ok: false, error: 'Please enter admin passcode.' };
    }
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ passcode: trimmed }),
      });

      if (response.ok) {
        setIsAdminState(true);
        setShouldHydrateFirebaseAuth(true);
        try {
          localStorage.setItem('raj_admin_active_v1', 'true');
        } catch {}
        return { ok: true };
      }

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      return {
        ok: false,
        error: data?.error || 'Invalid admin passcode. Use verified Google Admin Sign-In for full cloud sync.',
      };
    } catch {
      return { ok: false, error: 'Unable to verify passcode right now.' };
    }
  };

  const logout = async () => {
    try {
      if (user) {
        const [{ signOut }, { auth }] = await Promise.all([
          import('firebase/auth'),
          import('../lib/firebase'),
        ]);
        await signOut(auth);
      }
      fetch('/api/admin/session', {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }).catch(() => {});
      setUser(null);
      setIsAdminState(false);
      setShouldHydrateFirebaseAuth(false);
      try {
        localStorage.setItem('raj_admin_active_v1', 'false');
      } catch {}
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getAdminAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (user && isAuthorizedAdminUser(user)) {
      try {
        const idToken = await user.getIdToken();
        if (idToken) {
          headers.Authorization = `Bearer ${idToken}`;
        }
      } catch {}
    }
    return headers;
  }, [user]);

  const isAdmin = isAdminState || isAuthorizedAdminUser(user);
  const isCloudAdmin = isAuthorizedAdminUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isCloudAdmin,
        signInWithGoogle,
        loginWithPasscode,
        logout,
        toggleAdminMode,
        getAdminAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
