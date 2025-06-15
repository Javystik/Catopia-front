import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Вимикаємо withCredentials, оскільки cookies не використовуються
});

let accessToken = localStorage.getItem('accessToken');

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        accessToken = refreshRes.data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
        err.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(err.config);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export const setAccessToken = (token) => {
  accessToken = token;
  localStorage.setItem('accessToken', token);
};

export default api;