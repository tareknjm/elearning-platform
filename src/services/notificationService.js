import api from './api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data.count;
};

export const markAllAsRead = async () => {
  await api.put('/notifications/read-all');
};

export const markAsRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};