import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminRoute() {
  const location = useLocation();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios
      .get('/api/auth/me', { withCredentials: true })
      .then((res) => {
        const role = res.data?.role;
        if (isMounted) setAllowed(role === 'admin');
      })
      .catch(() => {
        if (isMounted) setAllowed(false);
      })
      .finally(() => {
        if (isMounted) setChecking(false);
      });
    return () => { isMounted = false; };
  }, []);

  if (checking) return null;
  if (!allowed) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
