import api from './api';

export const getApprovedCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const searchCourses = async (keyword) => {
  const response = await api.get(`/courses/search?keyword=${keyword}`);
  return response.data;
};

export const createCourse = async (data) => {
  const response = await api.post('/instructor/courses', data);
  return response.data;
};

export const getMyCourses = async () => {
  const response = await api.get('/instructor/courses');
  return response.data;
};

export const getAllCourses = async () => {
  const response = await api.get('/admin/courses');
  return response.data;
};

export const approveCourse = async (id) => {
  const response = await api.put(`/admin/courses/${id}/approve`);
  return response.data;
};

export const rejectCourse = async (id) => {
  const response = await api.put(`/admin/courses/${id}/reject`);
  return response.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const response = await api.get(`/courses/category/${categoryId}`);
  return response.data;
};