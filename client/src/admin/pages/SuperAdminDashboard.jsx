import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, analyticsRes, statusRes] = await Promise.all([
        axios.get('/api/superadmin/dashboard/overview', { withCredentials: true }),
        axios.get(`/api/superadmin/dashboard/analytics?period=${selectedPeriod}`, { withCredentials: true }),
        axios.get('/api/superadmin/dashboard/system-status', { withCredentials: true }),
      ]);

      setOverview(overviewRes.data);
      setAnalytics(analyticsRes.data);
      setSystemStatus(statusRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/superadmin/logout', {}, { withCredentials: true });
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#1C2B64', '#5272F2', '#FBECB2', '#F8BDEB'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Moohaar Super Admin</h1>
              <p className="text-slate-600">Platform Management Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/admins')}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Admins
              </button>
              <button
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={overview?.metrics?.users?.total || 0}
            change={overview?.metrics?.users?.growthRate || 0}
            icon="👥"
            color="blue"
          />
          <MetricCard
            title="Active Stores"
            value={overview?.metrics?.stores?.active || 0}
            change={overview?.metrics?.stores?.growthRate || 0}
            icon="🏪"
            color="green"
          />
          <MetricCard
            title="Total Themes"
            value={overview?.metrics?.themes?.total || 0}
            change={0}
            icon="🎨"
            color="purple"
          />
          <MetricCard
            title="Page Views (Today)"
            value={overview?.metrics?.pageViews?.today || 0}
            change={overview?.metrics?.pageViews?.growthRate || 0}
            icon="📊"
            color="orange"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Page Views Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Page Views Trend</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.analytics?.pageViews || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#1C2B64" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Signups Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">User Signups</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.analytics?.userSignups || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#5272F2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Theme Usage and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Theme Usage */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Theme Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.analytics?.themeUsage || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ themeName, percent }) => `${themeName} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="storeCount"
                >
                  {(analytics?.analytics?.themeUsage || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">System Status</h3>
            <div className="space-y-4">
              <StatusItem
                label="Database"
                status={systemStatus?.database?.connected ? 'healthy' : 'error'}
                details={systemStatus?.database?.connected ? 
                  `Latency: ${systemStatus.database.latency}ms` : 
                  systemStatus?.database?.error
                }
              />
              <StatusItem
                label="Redis Cache"
                status={systemStatus?.redis?.connected ? 'healthy' : 'warning'}
                details={systemStatus?.redis?.connected ? 'Connected' : 'Disconnected'}
              />
              <StatusItem
                label="Server Uptime"
                status="healthy"
                details={`${Math.floor(systemStatus?.system?.uptime / 3600)}h ${Math.floor((systemStatus?.system?.uptime % 3600) / 60)}m`}
              />
              <StatusItem
                label="Environment"
                status={systemStatus?.system?.environment === 'production' ? 'healthy' : 'warning'}
                details={systemStatus?.system?.environment}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Users</h3>
            <div className="space-y-3">
              {overview?.recentActivity?.users?.map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    New
                  </span>
                </div>
              )) || <p className="text-slate-500">No recent users</p>}
            </div>
          </div>

          {/* Recent Stores */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Stores</h3>
            <div className="space-y-3">
              {overview?.recentActivity?.stores?.map((store, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-slate-900">
                      {store.customDomain || `${store.handle}.moohaar.com`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Store
                  </span>
                </div>
              )) || <p className="text-slate-500">No recent stores</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value.toLocaleString()}</p>
          {change !== 0 && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Status Item Component
function StatusItem({ label, status, details }) {
  const statusConfig = {
    healthy: { color: 'text-green-600', bg: 'bg-green-100', icon: '✓' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠' },
    error: { color: 'text-red-600', bg: 'bg-red-100', icon: '✗' },
  };

  const config = statusConfig[status] || statusConfig.error;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className={`w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center text-sm font-bold`}>
          {config.icon}
        </span>
        <span className="font-medium text-slate-900">{label}</span>
      </div>
      <span className="text-sm text-slate-500">{details}</span>
    </div>
  );
}