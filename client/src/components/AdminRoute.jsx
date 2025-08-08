import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading.jsx';

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then((res) => {
        if (res.data.role === 'admin') setAllowed(true);
      })
      .catch(() => setAllowed(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <Loading />;
  return allowed ? children : <Navigate to="/login" />;
}
