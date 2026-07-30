import { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, getProfileAPI } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('giogreys_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profileData = await getProfileAPI(token);
          setUser(profileData);
        } catch (err) {
          console.error('Error restaurando sesión:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const data = await loginAPI(usernameOrEmail, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('giogreys_token', data.access_token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('giogreys_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
