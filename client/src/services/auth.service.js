import axios from 'axios';

function getCookie(name) {
  const found = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
}

async function ensureCsrf() {
  // If no CSRF cookie, fetch it first
  if (!getCookie('XSRF-TOKEN')) {
    await axios.get('/api/csrf-token', { withCredentials: true });
  }
  return getCookie('XSRF-TOKEN');
}

async function postWithCsrf(url, data) {
  const csrf = await ensureCsrf();
  return axios.post(url, data, {
    withCredentials: true,
    headers: { 'X-CSRF-Token': csrf },
  });
}

export async function login(creds) {
  return postWithCsrf('/api/auth/login', creds);
}

export async function register(payload) {
  return postWithCsrf('/api/auth/register', payload);
}

export async function logout() {
  return postWithCsrf('/api/auth/logout', {});
}
