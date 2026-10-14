import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('modeldock_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Default engineer user for immediate testing
    return {
      id: 1,
      username: 'lead.architect',
      email: 'lead@modeldock.io',
      role: 'ROLE_ADMIN',
      token: 'demo-token'
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('modeldock_user', JSON.stringify(user));
      if (user.token) setAuthToken(user.token);
    } else {
      localStorage.removeItem('modeldock_user');
      setAuthToken(null);
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    const loggedUser = await api.login(username, password);
    setUser(loggedUser);
  };

  const register = async (username: string, email: string, password: string, role: UserRole = 'ROLE_DEVELOPER') => {
    const registeredUser = await api.register(username, email, password, role);
    setUser(registeredUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'ROLE_VIEWER',
      isAuthenticated: !!user,
      login,
      register,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
