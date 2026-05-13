import api from './api';

export const markVideoWatched = async (videoId) => {
  await api.post(`/learner/videos/${videoId}/watch`);
};

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/learner/courses/${courseId}/progress`);
  return response.data;
};