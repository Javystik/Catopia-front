import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/tags';

export const getAllTags = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export const createTag = async (tagDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, tagDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

export const updateTag = async (tagId, tagDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${tagId}`, tagDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating tag with ID ${tagId}:`, error);
    throw error;
  }
};

export const deleteTag = async (tagId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${tagId}`);
  } catch (error) {
    console.error(`Error deleting tag with ID ${tagId}:`, error);
    throw error;
  }
};
