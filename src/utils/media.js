export const resolveMediaUrl = (url, apiBase = 'http://localhost:8080') => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${apiBase}${url}`;
};