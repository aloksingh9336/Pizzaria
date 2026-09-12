import { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../services/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    endpoints.me().then((r) => setUser(r.data.user)).catch(() => {
      localStorage.removeItem('token'); setToken(null);
    }).finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const r = await endpoints.login({ email, password });
    localStorage.setItem('token', r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data;
  };
  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, token, loading, login, logout }}>{children}</AuthCtx.Provider>;
}

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin') || 'null'); } catch { return null; }
  });
  const adminLogin = async (email, password) => {
    const r = await endpoints.adminLogin({ email, password });
    localStorage.setItem('adminToken', r.data.token);
    localStorage.setItem('admin', JSON.stringify(r.data.admin));
    setAdmin(r.data.admin);
    return r.data;
  };
  const adminLogout = () => {
    localStorage.removeItem('adminToken'); localStorage.removeItem('admin'); setAdmin(null);
  };
  return <AdminCtx.Provider value={{ admin, adminLogin, adminLogout }}>{children}</AdminCtx.Provider>;
}
