import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/reviews';

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getReviewById = async (novelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/${novelId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review with id ${novelId}:`, error);
    throw error;
  }
};

export const getReviewByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review for userId ${userId}:`, error);
    throw error;
  }
};

export const getReviewsByNovelId = async (novelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/byNovel/${novelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews by novel ID:', error);
    return [];
  }
};

export const getAllReviewsSortedByDate = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/sorted`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${apiUrl}/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    await axios.delete(`${API_BASE_URL}${apiUrl}/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
