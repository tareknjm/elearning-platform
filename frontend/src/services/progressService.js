import api from './api';

export const markVideoWatched = async (videoId) => {
  await api.post(`/learner/videos/${videoId}/watch`);
};

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/learner/courses/${courseId}/progress`);
  return response.data;
};
export const getResumeProgress = async () => {
  const response = await api.get('/learner/resume');
  if (response.status === 204 || !response.data) return null;
  return response.data;
};