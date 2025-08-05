import axios from 'axios';

export function getThemes(offset, limit, config = {}) {
  return axios.get(`/api/themes?offset=${offset}&limit=${limit}`, { withCredentials: true, ...config });
}

export function previewTheme(id, config = {}) {
  return axios.get(`/api/themes/${id}/preview`, { withCredentials: true, responseType: 'text', ...config });
}

export function selectTheme(id, config = {}) {
  return axios.post('/api/store/theme', { themeId: id }, { withCredentials: true, ...config });
}
