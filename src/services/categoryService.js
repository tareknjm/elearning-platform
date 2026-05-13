import api from './api';

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const response = await api.get(`/courses/category/${categoryId}`);
  return response.data;
};