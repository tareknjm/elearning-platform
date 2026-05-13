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