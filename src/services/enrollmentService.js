import api from './api';

export const enroll = async (courseId) => {
  const response = await api.post(`/learner/enroll/${courseId}`);
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get('/learner/enrollments');
  return response.data;
};
export const isEnrolled = async (courseId) => {
  const response = await api.get(`/learner/enrolled/${courseId}`);
  return response.data.enrolled;
};

export const unenroll = async (courseId) => {
  await api.delete(`/learner/unenroll/${courseId}`);
};

