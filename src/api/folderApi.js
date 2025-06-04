import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/folders';

export const createFolder = async (folderDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, folderDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const getAllFolders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

export const getAllFoldersByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching folders for user [${userId}]:`, error);
    return [];
  }
};

export const getFolderByFolderNovelId = async (folderNovelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/folderNovel/${folderNovelId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching folder by folderNovelId [${folderNovelId}]:`, error);
    return null;
  }
};

export const updateFolder = async (folderId, folderDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${folderId}`, folderDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating folder [${folderId}]:`, error);
    throw error;
  }
};

export const deleteFolder = async (folderId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${folderId}`);
  } catch (error) {
    console.error(`Error deleting folder [${folderId}]:`, error);
    throw error;
  }
};
