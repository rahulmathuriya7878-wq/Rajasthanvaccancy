'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

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
  loginWithPassword: (password: string) => boolean;
  logout: () => Promise<void>;
  toggleAdminMode: (enabled?: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isCloudAdmin: false,
  signInWithGoogle: async () => ({ ok: false }),
  loginWithPassword: () => false,
  logout: async () => {},
  toggleAdminMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Hydrate admin flag from localStorage after mount to avoid SSR hydration mismatches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('raj_admin_active_v1') === 'true';
      if (stored) {
        setIsAdminState(true);
        setLoading(true);
      }
    } catch {}
  }, []);

  // Hydrate Firebase Auth session whenever admin mode is active
  useEffect(() => {
    if (!isAdminState) {
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
            setIsAdminState(true);
            try {
              localStorage.setItem('raj_admin_active_v1', 'true');
            } catch {}

            // Persist user profile directly in Firestore (/users/{uid})
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
  }, [isAdminState]);

  const toggleAdminMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isAdminState;
    setIsAdminState(nextState);
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
        setIsAdminState(true);
        try {
          localStorage.setItem('raj_admin_active_v1', 'true');
        } catch {}
        void syncUserProfileToFirestore(result.user);
        return { ok: true, user: result.user };
      }
      return { ok: false, error: 'Google लॉगिन पूरा नहीं हुआ।' };
    } catch (err: any) {
      console.error('Google popup sign-in error:', err);
      const code = err?.code || '';
      const msg =
        code === 'auth/popup-blocked'
          ? 'ब्राउज़र ने Google लॉगिन पॉपअप ब्लॉक कर दिया। कृपया पॉपअप की अनुमति दें और पुनः प्रयास करें।'
          : code === 'auth/popup-closed-by-user'
            ? 'Google लॉगिन विंडो बंद कर दी गई। क्लाउड सिंक के लिए लॉगिन पूरा करें।'
            : err?.message || 'Google लॉगिन विफल रहा।';
      return { ok: false, error: msg };
    }
  };

  const loginWithPassword = (password: string) => {
    if (password && password.trim() === '78787739277877139203') {
      setIsAdminState(true);
      try {
        localStorage.setItem('raj_admin_active_v1', 'true');
      } catch {}
      return true;
    }
    return false;
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
      setUser(null);
      setIsAdminState(false);
      try {
        localStorage.setItem('raj_admin_active_v1', 'false');
      } catch {}
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdmin = isAdminState || !!user;
  const isCloudAdmin = !!(user && user.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isCloudAdmin,
        signInWithGoogle,
        loginWithPassword,
        logout,
        toggleAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
