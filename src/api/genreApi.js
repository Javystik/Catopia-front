import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/genres';

export const getAllGenres = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const createGenre = async (genreDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, genreDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating genre:', error);
    throw error;
  }
};

export const updateGenre = async (genreId, genreDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${genreId}`, genreDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating genre with ID ${genreId}:`, error);
    throw error;
  }
};

export const deleteGenre = async (genreId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${genreId}`);
  } catch (error) {
    console.error(`Error deleting genre with ID ${genreId}:`, error);
    throw error;
  }
};
