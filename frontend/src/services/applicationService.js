import api from './api';

export const submitApplication = async (formData) => {
  const response = await api.post('/applications/instructor', formData, {
    headers: { 'Content-Type': undefined }, // ← laisse axios générer le boundary
  });
  return response.data;
};

export const getAllApplications = async (archived = false) => {
  const response = await api.get(`/admin/applications?archived=${archived}`);
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/admin/applications/${id}`);
  return response.data;
};

export const scheduleInterview = async (id, interviewDateTime) => {
  const response = await api.put(`/admin/applications/${id}/schedule-interview`, {
    interviewDateTime,
  });
  return response.data;
};

export const reviewApplication = async (id, data) => {
  const response = await api.put(`/admin/applications/${id}/review`, data);
  return response.data;
};

export const archiveApplication = async (id) => {
  const response = await api.put(`/admin/applications/${id}/archive`);
  return response.data;
};

export const restoreApplication = async (id) => {
  const response = await api.put(`/admin/applications/${id}/restore`);
  return response.data;
};