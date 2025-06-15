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
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token');
      }
      setAccessToken(accessToken);

      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      await fetchUser();
    } catch (err) {
      console.error('Помилка логіну:', err);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { accessToken, refreshToken } = response.data;
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      await fetchUser();
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    } catch (err) {
      console.error('Помилка logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);