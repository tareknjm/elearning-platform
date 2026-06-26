import api from './api';

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};
export const changePassword = async (email, tempPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { email, tempPassword, newPassword });
  return response.data;
};