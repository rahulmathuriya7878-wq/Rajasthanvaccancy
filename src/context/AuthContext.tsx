import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

const ADMIN_EMAILS = [
  'rahulmathuriya7878@gmail.com',
  'admin@rajasthanvacancy.com'
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithAdminPin: (pin: string) => boolean;
  toggleAdminMode: (enabled?: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  loginWithAdminPin: () => false,
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
        // Auto grant admin if logged in email is in ADMIN_EMAILS
        if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
          setIsAdminState(true);
          try {
            localStorage.setItem('raj_admin_active_v1', 'true');
          } catch {}
        }

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

  const loginWithAdminPin = (pin: string): boolean => {
    if (pin.trim() === 'admin123' || pin.trim() === '7878' || pin.trim() === '2026') {
      setIsAdminState(true);
      try {
        localStorage.setItem('raj_admin_active_v1', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const toggleAdminMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isAdminState;
    setIsAdminState(nextState);
    try {
      localStorage.setItem('raj_admin_active_v1', nextState ? 'true' : 'false');
    } catch {}
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdminState(false);
      try {
        localStorage.setItem('raj_admin_active_v1', 'false');
      } catch {}
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdmin = isAdminState || (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout, loginWithAdminPin, toggleAdminMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
