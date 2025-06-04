import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/novels';

// Функція для створення новели
export const createNovel = async (novelCreateDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, novelCreateDTO, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating novel:', error);
    throw error;
  }
};

// Функція для отримання новели за ID
export const getNovelById = async (novelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${novelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching novel by id:', error);
    throw error;
  }
};

// Функція для пошуку новел за назвою
export const getNovelLightsByTitle = async (title) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/search`, { params: { title } });
    return response.data;
  } catch (error) {
    console.error('Error fetching novels by title:', error);
    throw error;
  }
};

// Функція для отримання останніх новел
export const getLatestNovelsAll = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/latest/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest novels:', error);
    throw error;
  }
};

// Функція для отримання останніх новел з главами
export const getLatestNovelsWithChapters = async (period) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/latest/with-chapters`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching latest novels with chapters:', error);
    throw error;
  }
};

// Функція для отримання новел користувача за userId
export const getNovelsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching novels by userId:', error);
    throw error;
  }
};

// Функція для отримання деталей новели за ID
export const getNovelDetailById = async (novelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/detail/${novelId}`);
    return response.data;
  } catch (error) {
    console.error('Помилка при отриманні деталей новели:', error);
    throw error;
  }
};

// Функція для отримання трендових новел
export const getTrendingNovels = async (period) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/trending`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending novels:', error);
    throw error;
  }
};

// Функція для пошуку новел за фільтрами
export const searchNovels = async (filter) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}/search`, filter);
    return response.data;
  } catch (error) {
    console.error('Error searching novels:', error);
    throw error;
  }
};

// Функція для отримання найбільш популярних новел
export const getMostPopularNovels = async (period) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/most-popular`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching most popular novels:', error);
    throw error;
  }
};

// Функція для отримання останніх новел, відсортованих за датою створення
export const getLatestNovelsSortedByCreationDate = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/latest/sorted`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest sorted novels:', error);
    throw error;
  }
};

// Функція для отримання останніх новел, відсортованих за датою оновлення
export const getLatestNovelsSortedByUpdatedAt = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/latest/sorted-by-update`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest novels sorted by updatedAt:', error);
    throw error;
  }
};

// Функція для оновлення новели за ID
export const updateNovelById = async (novelId, novelDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${novelId}`, novelDTO);
    return response.data;
  } catch (error) {
    console.error('Error updating novel by id:', error);
    throw error;
  }
};

// Функція для видалення новели за ID
export const deleteNovelById = async (novelId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${novelId}`);
  } catch (error) {
    console.error('Error deleting novel by id:', error);
    throw error;
  }
};
