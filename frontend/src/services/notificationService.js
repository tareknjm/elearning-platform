import api from './api';

export const getNotifications = async (archived = false) => {
  const response = await api.get(`/notifications?archived=${archived}`);
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

export const archiveNotification = async (id) => {
  const response = await api.put(`/notifications/${id}/archive`);
  return response.data;
};

export const restoreNotification = async (id) => {
  const response = await api.put(`/notifications/${id}/restore`);
  return response.data;
};

export const archiveAllRead = async () => {
  await api.put('/notifications/archive-all-read');
};