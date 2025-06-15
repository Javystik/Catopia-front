import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAccessToken } from '../context/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const setTokens = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken); // Зберігаємо refreshToken
  };

  const fetchUser = async () => {
    try {
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        setAccessToken(null);
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Спробуємо оновити токен при завантаженні
      api
        .post('/auth/refresh', { refreshToken })
        .then((res) => {
          setTokens(res.data.accessToken, res.data.refreshToken);
          fetchUser();
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      navigate('/');
    } catch (err) {
      console.error('Помилка logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);