import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './useAuth';
import { supabase } from '../supabaseClient';

const AUTH_STORAGE_KEY = 'barkcard-auth-user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error reading Supabase session:', error);
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        if (!data.session) {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Unexpected error syncing auth state:', error);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    };

    syncAuthState();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      setUser: updateUser,
      login,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
