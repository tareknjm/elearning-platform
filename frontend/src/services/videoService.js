import api from './api';

export const uploadVideo = async (formData) => {
  const response = await api.post('/instructor/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getVideosByCourse = async (courseId) => {
  const response = await api.get(`/videos/course/${courseId}`);
  return response.data;
};

export const deleteVideo = async (videoId) => {
  await api.delete(`/instructor/videos/${videoId}`);
};

// Admin
export const getPendingVideos = async () => {
  const response = await api.get('/admin/videos/pending');
  return response.data;
};

export const approveVideo = async (id) => {
  const response = await api.put(`/admin/videos/${id}/approve`);
  return response.data;
};

export const rejectVideo = async (id) => {
  const response = await api.put(`/admin/videos/${id}/reject`);
  return response.data;
};
export const getAllVideos = async (archived = false) => {
  const response = await api.get(`/admin/videos?archived=${archived}`);
  return response.data;
};

export const archiveVideo = async (id) => {
  const response = await api.put(`/admin/videos/${id}/archive`);
  return response.data;
};

export const restoreVideo = async (id) => {
  const response = await api.put(`/admin/videos/${id}/restore`);
  return response.data;
};
