import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  exchangeSupabaseSession,
  fetchAuthStatus,
  logoutWorkspace,
} from '../services/authService';
import { supabaseClient } from '../services/supabaseClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  checkAuthStatus: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      let data = await fetchAuthStatus();

      if (!data?.authenticated) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (sessionData?.session?.access_token) {
          await exchangeSupabaseSession(sessionData.session);
          data = await fetchAuthStatus();
        }
      }

      if (data?.authenticated && data.user) {
        setUser({
          ...data.user,
          hasGoogleToken: Boolean(data.hasGoogleToken),
          authProvider: data.authProvider || null,
          emailVerified: Boolean(data.emailVerified),
          canUseGoogleFeatures: Boolean(data.canUseGoogleFeatures),
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutWorkspace();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    checkAuthStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
