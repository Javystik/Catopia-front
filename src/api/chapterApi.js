import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/chapters';

// Функція для отримання всіх глав
export const getAllChapters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

// Функція для отримання глави за ID
export const getChapterById = async (chapterId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chapter by id:', error);
    return null;
  }
};

export const findChapterByVolumeAndChapterNumber = async (novelId, volumeNumber, chapterNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${apiUrl}/find/${novelId}/${volumeNumber}/${chapterNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
};

// Отримати попередню главу
export const getPreviousChapter = async (novelId, volumeNumber, chapterNumber) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${novelId}/${volumeNumber}/${chapterNumber}/previous`);
    return response.data;
  } catch  {
    return null;
  }
};

// Отримати наступну главу
export const getNextChapter = async (novelId, volumeNumber, chapterNumber) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${novelId}/${volumeNumber}/${chapterNumber}/next`);
    return response.data;
  } catch {
    return null;
  }
};

// Функція для створення нової глави
export const createChapter = async (chapterDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, chapterDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating chapter:', error);
    return null;
  }
};

// Функція для оновлення глави
export const updateChapter = async (chapterId, chapterDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${chapterId}`, chapterDTO);
    return response.data;
  } catch (error) {
    console.error('Error updating chapter:', error);
    return null;
  }
};

// Функція для видалення глави
export const deleteChapter = async (chapterId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${chapterId}`);
    return true;
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return false;
  }
};
