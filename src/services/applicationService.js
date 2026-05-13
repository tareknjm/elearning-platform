import api from './api';

export const submitApplication = async (data) => {
  const response = await api.post('/applications/instructor', data);
  return response.data;
};

export const getAllApplications = async () => {
  const response = await api.get('/admin/applications');
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/admin/applications/${id}`);
  return response.data;
};

export const reviewApplication = async (id, data) => {
  const response = await api.put(`/admin/applications/${id}/review`, data);
  return response.data;
};