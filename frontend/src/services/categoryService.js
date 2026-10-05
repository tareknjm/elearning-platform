import api from './api';

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const response = await api.get(`/courses/category/${categoryId}`);
  return response.data;
};

export const createCategory = async (name, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  if (imageFile) formData.append('image', imageFile);
  const response = await api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createSubCategory = async (parentId, name, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  if (imageFile) formData.append('image', imageFile);
  const response = await api.post(`/categories/${parentId}/sub`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};