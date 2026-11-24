'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

const AUTHORIZED_ADMIN_EMAIL = 'rahulmathuriya7878@gmail.com';
const STORAGE_KEY_REGULAR_AUTH = 'raj_user_sync_active_v1';

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
  signInRegularUserWithGoogle: () => Promise<GoogleSignInResult>;
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
  signInRegularUserWithGoogle: async () => ({ ok: false }),
  loginWithPasscode: async () => ({ ok: false }),
  logout: async () => {},
  toggleAdminMode: () => {},
  getAdminAuthHeaders: async () => ({ 'X-Requested-With': 'XMLHttpRequest' }),
});

function isAuthorizedAdminUser(u: User | null): boolean {
  if (!u || !u.emailVerified || !u.email) return false;
  return u.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
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

  // Hydrate admin / user sync flags from localStorage after mount to avoid SSR hydration mismatches
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('raj_admin_active_v1') === 'true';
      const storedRegular = localStorage.getItem(STORAGE_KEY_REGULAR_AUTH) === 'true';
      if (storedAdmin) {
        setIsAdminState(true);
        setShouldHydrateFirebaseAuth(true);
        setLoading(true);
      } else if (storedRegular) {
        setShouldHydrateFirebaseAuth(true);
        setLoading(true);
      }
    } catch {}
  }, []);

  // Hydrate Firebase Auth session whenever admin mode OR regular user cloud alert sync is active
  useEffect(() => {
    if (!shouldHydrateFirebaseAuth && !isAdminState) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const [{ onAuthStateChanged }, { auth }, { syncUserProfileToFirestore }] = await Promise.all([
          import('firebase/auth'),
          import('../lib/firebase'),
          import('../services/firebaseUserService'),
        ]);
        if (!isMounted) return;

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);
          setLoading(false);

          if (currentUser) {
            if (isAuthorizedAdminUser(currentUser)) {
              setIsAdminState(true);
              try {
                localStorage.setItem('raj_admin_active_v1', 'true');
              } catch {}
              void exchangeAdminSessionCookie(currentUser);
            } else {
              try {
                localStorage.setItem(STORAGE_KEY_REGULAR_AUTH, 'true');
              } catch {}
            }

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
  }, [shouldHydrateFirebaseAuth, isAdminState]);

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
      const [{ signInWithPopup }, { auth, googleAuthProvider }, { syncUserProfileToFirestore }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
        import('../services/firebaseUserService'),
      ]);
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        setUser(result.user);
        setShouldHydrateFirebaseAuth(true);
        const verifiedAdmin = isAuthorizedAdminUser(result.user);
        if (verifiedAdmin) {
          setIsAdminState(true);
          try {
            localStorage.setItem('raj_admin_active_v1', 'true');
          } catch {}
          await exchangeAdminSessionCookie(result.user);
        }
        void syncUserProfileToFirestore(result.user);
        if (!verifiedAdmin) {
          return {
            ok: false,
            error: 'यह Google अकाउंट एडमिन के रूप में अधिकृत नहीं है। सामान्य जॉब अलर्ट सिंक के लिए यह अकाउंट उपयोग किया जा सकता है।',
          };
        }
        return { ok: true, user: result.user };
      }
      return { ok: false, error: 'Google लॉगिन पूरा नहीं हुआ।' };
    } catch (err: any) {
      console.error('Google popup sign-in error:', err);
      const code = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'rajasthanvacancy.online';
      const msg =
        code === 'auth/unauthorized-domain'
          ? `Firebase Auth में "${currentHost}" डोमेन अभी अनुमति सूची (Authorized Domains) में नहीं है। समाधान: (1) तुरंत लॉगिन के लिए https://ais-pre-xr5evgohw4ejjzuf775vak-300878841095.asia-southeast1.run.app खोलें, या (2) एडमिन पासकोड से लॉगिन करें, या (3) Firebase Console → Authentication → Settings → Authorized domains में "${currentHost}" और "www.${currentHost.replace(/^www\./, '')}" जोड़ें।`
          : code === 'auth/popup-blocked'
            ? 'ब्राउज़र ने Google लॉगिन पॉपअप ब्लॉक कर दिया। कृपया पॉपअप की अनुमति दें और पुनः प्रयास करें।'
            : code === 'auth/popup-closed-by-user'
              ? 'Google लॉगिन विंडो बंद कर दी गई। क्लाउड सिंक के लिए लॉगिन पूरा करें।'
              : err?.message || 'Google लॉगिन विफल रहा।';
      return { ok: false, error: msg };
    }
  };

  // Safe Google Sign-In for regular users syncing their Job Alert Preferences (never grants admin UI unless authorized admin email)
  const signInRegularUserWithGoogle = async (): Promise<GoogleSignInResult> => {
    try {
      const [{ signInWithPopup }, { auth, googleAuthProvider }, { syncUserProfileToFirestore }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
        import('../services/firebaseUserService'),
      ]);
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        setUser(result.user);
        setShouldHydrateFirebaseAuth(true);
        try {
          localStorage.setItem(STORAGE_KEY_REGULAR_AUTH, 'true');
        } catch {}
        if (isAuthorizedAdminUser(result.user)) {
          setIsAdminState(true);
          try {
            localStorage.setItem('raj_admin_active_v1', 'true');
          } catch {}
          void exchangeAdminSessionCookie(result.user);
        }
        void syncUserProfileToFirestore(result.user);
        return { ok: true, user: result.user };
      }
      return { ok: false, error: 'Google sign-in did not complete.' };
    } catch (err: any) {
      const code = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'rajasthanvacancy.online';
      const msg =
        code === 'auth/unauthorized-domain'
          ? `Domain "${currentHost}" is not yet added to Firebase Authorized Domains. Your job alerts remain saved on this device automatically.`
          : code === 'auth/popup-blocked'
            ? 'Please allow browser popups to sync job alerts with Google.'
            : code === 'auth/popup-closed-by-user'
              ? 'Sign-in window closed.'
              : err?.message || 'Unable to sign in right now.';
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
        localStorage.removeItem(STORAGE_KEY_REGULAR_AUTH);
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
        signInRegularUserWithGoogle,
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
