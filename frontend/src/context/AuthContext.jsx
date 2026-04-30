import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // { id, phone, role }
  const [loading, setLoading] = useState(true); // resolving stored token on mount

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (!token) { setLoading(false); return; }
    api.getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('ff_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone, password) => {
    const { token } = await api.login({ phone, password });
    localStorage.setItem('ff_token', token);
    const me = await api.getMe();
    setUser(me);
    return me;
  };

  const register = async (phone, password) => {
    await api.register({ phone, password });
    return login(phone, password);
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
