import api from './api';

export const activateSubscription = async (billing) => {
  const response = await api.post(`/subscription/activate?billing=${billing}`);
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await api.post('/subscription/cancel');
  return response.data;
};

export const getSubscriptionStatus = async () => {
  const response = await api.get('/subscription/status');
  return response.data;
};