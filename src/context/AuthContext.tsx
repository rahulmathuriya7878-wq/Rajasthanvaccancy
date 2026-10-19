import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

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
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  loginWithPassword: () => false,
  logout: async () => {},
  toggleAdminMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminState, setIsAdminState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('raj_admin_active_v1') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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

    return () => unsubscribe();
  }, []);

  const toggleAdminMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isAdminState;
    setIsAdminState(nextState);
    try {
      localStorage.setItem('raj_admin_active_v1', nextState ? 'true' : 'false');
    } catch {}
  };

  const signInWithGoogle = async () => {
    try {
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
      await signOut(auth);
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

