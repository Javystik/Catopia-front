import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/comments';

export const createComment = async (commentDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, commentDTO);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getAllComments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const getCommentsByChapterId = async (chapterId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for chapter ${chapterId}:`, error);
    return [];
  }
};

export const getCommentsByNovelId = async (novelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/novel/${novelId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for novel ${novelId}:`, error);
    return [];
  }
};

export const getCommentsByReviewId = async (reviewId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/review/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for review ${reviewId}:`, error);
    return [];
  }
};

export const updateComment = async (commentId, commentDTO) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${commentId}`, commentDTO);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${commentId}`);
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};
