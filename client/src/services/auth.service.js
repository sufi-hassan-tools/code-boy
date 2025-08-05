import axios from 'axios';

export async function login(creds) {
  return axios.post('/api/auth/login', creds, { withCredentials: true });
}
export async function logout() {
  return axios.post('/api/auth/logout', {}, { withCredentials: true });
}
