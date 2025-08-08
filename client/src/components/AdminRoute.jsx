import { Navigate, Outlet, useLocation } from 'react-router-dom';

function getCookie(name) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function AdminRoute() {
  const location = useLocation();
  const token = getCookie('accessToken');
  const payload = token ? decodeJwt(token) : null;
  const isValid = payload && (!payload.exp || payload.exp * 1000 > Date.now());
  const isAdmin = payload?.user?.role === 'admin' || payload?.role === 'admin';

  if (!isValid || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
