import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/apiClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  handleDiscordCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await apiClient.post('/auth/validate-token');
          if (response.data.valid) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Token validation failed', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async () => {
    try {
      const response = await apiClient.get('/auth/discord/login');
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Failed to get Discord login URL', error);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleDiscordCallback = async (code: string) => {
    try {
      const response = await apiClient.get(`/auth/discord/callback?code=${code}`);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Discord callback failed', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, handleDiscordCallback }}>
      {children}
    </AuthContext.Provider>
  );
};