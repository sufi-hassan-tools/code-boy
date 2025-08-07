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

export function getStores(offset, limit, search, config = {}) {
  return axios.get('/api/admin/stores', {
    params: { offset, limit, search },
    withCredentials: true,
    ...config
  });
}

export function getStoreMetrics(storeId, from, to, config = {}) {
  return axios.get(`/api/admin/stores/${storeId}/metrics`, {
    params: { from, to },
    withCredentials: true,
    ...config
  });
}

export function getUsers(offset, limit, search, config = {}) {
  return axios.get('/api/admin/users', {
    params: { offset, limit, search },
    withCredentials: true,
    ...config
  });
}
