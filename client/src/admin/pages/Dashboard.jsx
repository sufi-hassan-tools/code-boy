import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

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

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('accessToken');
    const payload = token ? decodeJwt(token) : null;
    const isAdmin = payload?.user?.role === 'admin' || payload?.role === 'admin';
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="text-xl">Admin Dashboard</div>
    </AdminLayout>
  );
}
