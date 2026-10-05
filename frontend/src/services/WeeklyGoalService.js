import api from './api';

export const getWeeklyGoal = async () => {
  const response = await api.get('/learner/weekly-goal');
  return response.data;
};

export const updateWeeklyGoal = async (targetLessons) => {
  const response = await api.put(`/learner/weekly-goal?targetLessons=${targetLessons}`);
  return response.data;
};