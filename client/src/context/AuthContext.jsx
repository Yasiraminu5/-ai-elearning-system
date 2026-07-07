import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// ── Create the context ────────────────────────────────────────
const AuthContext = createContext(null);

// ── Auth Provider Component ───────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ── On app load, fetch current user if token exists ──────────
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // ── Helper to clear auth state ────────────────────────────────
  const clearAuth = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // ── Login function ────────────────────────────────────────────
  const login = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  // ── Logout function ───────────────────────────────────────────
  const logout = () => {
    clearAuth();
  };

  // ── Update user in context (used after profile edits) ─────────
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom hook for consuming auth context ────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default AuthContext;