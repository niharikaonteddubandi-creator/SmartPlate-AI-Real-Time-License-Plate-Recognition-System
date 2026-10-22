import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Token invalid or expired", err);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (usernameOrEmail, password) => {
    const data = await api.login(usernameOrEmail, password);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password, fullName) => {
    const data = await api.register(username, email, password, fullName);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
