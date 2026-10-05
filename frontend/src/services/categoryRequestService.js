import api from './api';

export const createCategoryRequest = async (data) => {
  const response = await api.post('/instructor/category-requests', data);
  return response.data;
};

export const getMyCategoryRequests = async () => {
  const response = await api.get('/instructor/category-requests');
  return response.data;
};

export const getAllCategoryRequests = async () => {
  const response = await api.get('/admin/category-requests');
  return response.data;
};

export const reviewCategoryRequest = async (id, decision, adminNote) => {
  const response = await api.post(`/admin/category-requests/${id}/review`, {
    decision, adminNote,
  });
  return response.data;
};