import api from './api';

export const getQuiz = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/quiz`);
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post(`/learner/quiz/${quizId}/submit`, { answers });
  return response.data;
};

export const hasPassed = async (courseId) => {
  const response = await api.get(`/learner/courses/${courseId}/passed`);
  return response.data.passed;
};

export const downloadCertificate = async (courseId) => {
  const response = await api.get(`/learner/courses/${courseId}/certificate`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'certificat.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
};