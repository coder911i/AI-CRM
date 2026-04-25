'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api-client';

interface User {
  id: string;
  sub: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  tenant?: {
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; tenantName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('waterting_user');
      if (cached) return JSON.parse(cached);
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('waterting_user') && !!getToken();
    }
    return true;
  });

  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      api.get<User>('/auth/me')
        .then(u => {
          localStorage.setItem('waterting_user', JSON.stringify(u));
          setUser(u);
        })
        .catch(() => { clearToken(); setUser(null); })
        .finally(() => setLoading(false));
    } else if (!token) {
      setLoading(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.publicPost<{ access_token: string; user: User }>('/auth/login', { email, password });
    setToken(res.access_token);
    localStorage.setItem('waterting_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; name: string; tenantName: string }) => {
    const res = await api.publicPost<{ access_token: string; user: User }>('/auth/register', data);
    setToken(res.access_token);
    localStorage.setItem('waterting_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
