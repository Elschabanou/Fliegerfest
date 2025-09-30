'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = Cookies.get('auth-token');
    if (storedToken) {
      // Verifiziere Token mit dem Server
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.user) {
            setToken(storedToken);
            setUser(data.user);
          } else {
            Cookies.remove('auth-token');
          }
        })
        .catch(() => {
          Cookies.remove('auth-token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    Cookies.set('auth-token', newToken, { expires: 7 }); // 7 Tage
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove('auth-token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
