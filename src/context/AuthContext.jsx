import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAccessToken } from '../context/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const tokenRes = await api.post('/auth/refresh');
      const token = tokenRes.data;
      setAccessToken(token);

      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        setAccessToken(null);
        const protectedRoutes = ['/dashboard', '/profile'];
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/login', { state: { from: location.pathname } });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setAccessToken(null);
      navigate('/');
    } catch (err) {
      console.error('Помилка logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);