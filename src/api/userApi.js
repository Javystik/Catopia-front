import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/users';

export const createUser = async (userCreateDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, userCreateDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/byId/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user by ID [${userId}]:`, error);
    throw error;
  }
};

export const addRoleToUser = async (userId, roleName) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}${apiUrl}/${userId}/add-role`, null, {
      params: { roleName },
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding role [${roleName}] to user [${userId}]:`, error);
    throw error;
  }
};

export const removeRoleFromUser = async (userId, roleName) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}${apiUrl}/${userId}/remove-role`, null, {
      params: { roleName },
    });
    return response.data;
  } catch (error) {
    console.error(`Error removing role [${roleName}] from user [${userId}]:`, error);
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/byUsername/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user by username [${username}]:`, error);
    throw error;
  }
};

export const updateUser = async (userId, userDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${userId}`, userDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating user [${userId}]:`, error);
    throw error;
  }
};

export const updateUserAvatar = async (userId, avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);

  try {
    const response = await axios.patch(`${API_BASE_URL}${apiUrl}/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating avatar for user [${userId}]:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${userId}`);
  } catch (error) {
    console.error(`Error deleting user [${userId}]:`, error);
    throw error;
  }
};
