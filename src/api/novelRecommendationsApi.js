import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const apiUrl = '/novels/recommendations';

export const getRecommendationsForUnauthorized = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${apiUrl}/unauthorized`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export const updateRecommendationCache = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}${apiUrl}/update-cache`);
    console.log(response.data);
  } catch (error) {
    console.error('Error updating recommendation cache:', error);
  }
};
