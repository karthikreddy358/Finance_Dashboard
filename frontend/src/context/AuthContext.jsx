import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by fetching profile
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        // If profile fetch fails, clear any stale auth state
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response?.token) {
      localStorage.setItem('token', response.token);
    }
    setUser(response.data.user);
    return response;
  };

  const register = async (name, email, password, role) => {
    const response = await authAPI.register({ name, email, password, role });
    if (response?.token) {
      localStorage.setItem('token', response.token);
    }
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
