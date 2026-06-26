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

export const createCourse = async (data, imageFile) => {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.level) formData.append('level', data.level);
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  formData.append('image', imageFile);

  const response = await api.post('/instructor/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyCourses = async (archived = false) => {
  const response = await api.get(`/instructor/courses?archived=${archived}`);
  return response.data;
};

export const getAllCourses = async (archived = false) => {
  const response = await api.get(`/admin/courses?archived=${archived}`);
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

export const archiveCourse = async (id) => {
  const response = await api.put(`/courses/${id}/archive`);
  return response.data;
};

export const restoreCourse = async (id) => {
  const response = await api.put(`/courses/${id}/restore`);
  return response.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const response = await api.get(`/courses/category/${categoryId}`);
  return response.data;
};