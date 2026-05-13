import api from './api';

export const getInstructorAnalytics = async () => {
  const response = await api.get('/instructor/analytics');
  return response.data;
};