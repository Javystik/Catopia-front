import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { API_BASE_URL } from '../config/config';
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { fetchUser, setTokens } = useAuth(); // Додаємо setTokens з AuthContext
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { notify } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Електронна пошта обов’язкова';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введіть дійсну електронну пошту';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов’язковий';
    } else if (formData.password.length < 5) {
      newErrors.password = 'Пароль повинен містити принаймні 5 символів';
    }

    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = 'Ім’я користувача обов’язкове';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Ім’я користувача повинно містити принаймні 3 символи';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Підтвердження пароля обов’язкове';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Паролі не збігаються';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notify('info', 'Будь ласка, виправте помилки у формі');
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await fetch(`${API_BASE_URL}/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username || null,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (!isLogin && data === 'Користувач з таким email або ім\'ям вже існує') {
          notify('error', 'Електронна пошта або ім’я користувача вже використовується');
        } else {
          notify('error', isLogin ? 'Неправильна пошта або пароль' : 'Помилка реєстрації');
        }
        return;
      }

      // Зберігаємо токени
      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      notify('success', isLogin ? 'Успішний вхід!' : 'Реєстрація успішна!');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Щось пішло не так. Спробуйте ще раз.');
    }
  };

  // Обробка OAuth2 редиректу
  const handleOAuthRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      await fetchUser();
      notify('success', 'Успішний вхід через соцмережу!');
      navigate('/');
    }
  };

  React.useEffect(() => {
    handleOAuthRedirect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <h1 className="text-4xl font-bold text-blue-700 mb-6 drop-shadow-lg">Catopia</h1>

      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg transition ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Вхід
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg transition ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Реєстрація
          </button>
        </div>

        <p className="text-center text-gray-500 mb-4">
          {isLogin ? 'Увійти через соцмережі' : 'Зареєструйтесь через соцмережі'}
        </p>

        <div className="flex justify-center space-x-4 mb-6 text-xl">
          <a
            href={`${API_BASE_URL}/oauth2/authorization/google`}
            className="bg-gray-200 hover:bg-red-100 text-red-600 w-10 h-10 rounded-full flex items-center justify-center transition"
            title="Google"
          >
            <FaGoogle />
          </a>
          <a
            href={`${API_BASE_URL}/oauth2/authorization/github`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition"
            title="GitHub"
          >
            <FaGithub />
          </a>
        </div>

        <p className="text-center text-gray-500 mb-4">
          {isLogin ? 'Або увійдіть з email і паролем' : 'Або зареєструйтесь з email і паролем'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Електронна пошта"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {!isLogin && (
            <div className="mb-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Ім'я користувача"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : ''
                }`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
          )}

          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Пароль"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div className="mb-4">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Повторіть пароль"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        {isLogin && (
          <p className="text-center text-gray-500 mt-6">
            Забули пароль?{' '}
            <Link to="/reset" className="text-blue-600 hover:underline">
              Відновити
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;