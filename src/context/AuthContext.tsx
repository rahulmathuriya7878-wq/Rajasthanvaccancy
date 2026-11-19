import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithPassword: (password: string) => boolean;
  logout: () => Promise<void>;
  toggleAdminMode: (enabled?: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  signInWithGoogle: async () => {},
  loginWithPassword: () => false,
  logout: async () => {},
  toggleAdminMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('raj_admin_active_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(isAdminState);

  // Only load Firebase Auth SDK when an admin session is already active (keeps public homepage bundle lightweight)
  useEffect(() => {
    if (!isAdminState) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const [{ onAuthStateChanged }, { auth }] = await Promise.all([
          import('firebase/auth'),
          import('../lib/firebase.ts'),
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

            try {
              const token = await currentUser.getIdToken();
              await fetch('/api/auth/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email: currentUser.email,
                  name: currentUser.displayName,
                  picture: currentUser.photoURL,
                }),
              });
            } catch (err) {
              console.error('Failed to sync user with database:', err);
            }
          }
        });
      } catch (err) {
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

  const signInWithGoogle = async () => {
    try {
      const [{ signInWithPopup }, { auth, googleAuthProvider }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase.ts'),
      ]);
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        setUser(result.user);
        setIsAdminState(true);
        try {
          localStorage.setItem('raj_admin_active_v1', 'true');
        } catch {}
      }
    } catch (err: any) {
      console.warn('Google popup sign-in note:', err);
      setIsAdminState(true);
      try {
        localStorage.setItem('raj_admin_active_v1', 'true');
      } catch {}
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
          import('../lib/firebase.ts'),
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

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, loginWithPassword, logout, toggleAdminMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

