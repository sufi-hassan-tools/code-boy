import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';

export default function SuperAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    checkSuperAdminAuth();
  }, []);

  const checkSuperAdminAuth = async () => {
    try {
      const response = await axios.get('/api/superadmin/me', { withCredentials: true });
      const adminData = response.data.admin;
      
      if (adminData && adminData.role === 'superadmin') {
        setAuthorized(true);
        setAdmin(adminData);
      } else {
        setAuthorized(false);
      }
    } catch (error) {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}