import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './admin/pages/Login';
import AdminRegister from './admin/pages/Register';
// Lazily load heavy pages for route-based code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminDashboard = React.lazy(() => import('./admin/pages/Dashboard'));
const StoresList = React.lazy(() => import('./admin/pages/StoresList'));
const StoreDetails = React.lazy(() => import('./admin/pages/StoreDetails'));
const Users = React.lazy(() => import('./admin/pages/Users'));
const ThemeAdmin = React.lazy(() => import('./admin/pages/ThemeAdmin'));
const Settings = React.lazy(() => import('./admin/pages/Settings'));
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import CreateStore from './pages/CreateStore';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const ThemeStore = React.lazy(() => import('./pages/ThemeStore'));
const ThemeUpload = React.lazy(() => import('./pages/ThemeUpload'));
// Super Admin Components
const OwnerAdminRegister = React.lazy(() => import('./superadmin/pages/OwnerAdminRegister'));
const OwnerAdminLogin = React.lazy(() => import('./superadmin/pages/OwnerAdminLogin'));
const OwnerAdminDashboard = React.lazy(() => import('./superadmin/pages/OwnerAdminDashboard'));
import Loading from './components/Loading';
import AdminRoute from './components/AdminRoute';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <Loading />;
  return allowed ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      {/* Display fallback while lazy components load */}
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/create-store" element={<PrivateRoute><CreateStore /></PrivateRoute>} />
          <Route path="/themes" element={<ThemeStore />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="stores" element={<StoresList />} />
            <Route path="stores/:storeId" element={<StoreDetails />} />
            <Route path="users" element={<Users />} />
            <Route path="themes" element={<ThemeAdmin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/upload-theme" element={<PrivateRoute><ThemeUpload /></PrivateRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Super Admin Routes */}
          <Route path="/sufimoohaaradmin" element={<OwnerAdminRegister />} />
          <Route path="/sufimoohaaradmin/login" element={<OwnerAdminLogin />} />
          <Route path="/owner-admin/dashboard" element={<OwnerAdminDashboard />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}
