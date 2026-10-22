import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('okfit_token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('okfit_theme') || 'dark');

  // Sync theme with DOM attribute
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('okfit_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem('okfit_token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (isMounted && data?.user) {
          setUser(data.user);
        } else if (isMounted) {
          // Fallback user from localStorage if offline
          const storedUser = localStorage.getItem('okfit_user');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        // If 401 or invalid token, clear
        const storedUser = localStorage.getItem('okfit_user');
        if (storedUser && !err.response) {
          if (isMounted) setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('okfit_token');
          localStorage.removeItem('okfit_user');
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    if (data?.token) {
      localStorage.setItem('okfit_token', data.token);
      setToken(data.token);
    }
    if (data?.user) {
      localStorage.setItem('okfit_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data?.token) {
      localStorage.setItem('okfit_token', data.token);
      setToken(data.token);
    }
    if (data?.user) {
      localStorage.setItem('okfit_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('okfit_token');
    localStorage.removeItem('okfit_user');
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('okfit_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    theme,
    toggleTheme,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
