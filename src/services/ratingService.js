import api from './api';

export const rateCourse = async (courseId, stars, comment) => {
  const response = await api.post(`/learner/courses/${courseId}/rate`, {
    stars,
    comment,
  });
  return response.data;
};

export const getRatingStats = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/ratings`);
  return response.data;
};