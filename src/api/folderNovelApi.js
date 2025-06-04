import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/folder-novels';

export const createFolderNovel = async (folderNovelDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, folderNovelDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating FolderNovel:', error);
    throw error;
  }
};

export const getAllFolderNovels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching FolderNovels:', error);
    return [];
  }
};

export const getFolderNovelsByNovelIdAndUserId = async (novelId, userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${novelId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching FolderNovels for novel [${novelId}] and user [${userId}]:`, error);
    return [];
  }
};

export const getAllFolderNovelsByFolderId = async (folderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${folderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching FolderNovels for folder [${folderId}]:`, error);
    return [];
  }
};

export const updateFolderNovel = async (folderId, novelId, folderNovelDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${folderId}/${novelId}`, folderNovelDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating FolderNovel [${folderId}, ${novelId}]:`, error);
    throw error;
  }
};

export const deleteFolderNovel = async (folderId, novelId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${folderId}/${novelId}`);
  } catch (error) {
    console.error(`Error deleting FolderNovel [${folderId}, ${novelId}]:`, error);
    throw error;
  }
};