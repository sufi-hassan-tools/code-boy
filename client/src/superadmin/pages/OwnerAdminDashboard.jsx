import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PermissionMatrix from '../components/PermissionMatrix';

export default function OwnerAdminDashboard() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [realtimeActivity, setRealtimeActivity] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [adminName, setAdminName] = useState('');

  // Create Admin Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'editor',
    permissions: {},
    sessionTimeout: 7200000 // 2 hours default
  });

  // Approve Super Admin Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAdmin, setApprovalAdmin] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState(true);
  const [customPermissions, setCustomPermissions] = useState({});

  useEffect(() => {
    fetchDashboardData();
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
      setAdminName(adminName);
    }

    // Set up real-time updates
    const interval = setInterval(fetchRealtimeActivity, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, approvalsRes, adminsRes, activityRes, blockedRes] = await Promise.all([
        axios.get('/api/super-admin/security/stats'),
        axios.get('/api/super-admin/management/pending-approvals'),
        axios.get('/api/super-admin/management/all?limit=10'),
        axios.get('/api/super-admin/security/real-time-activity'),
        axios.get('/api/super-admin/security/blocked-ips?limit=5')
      ]);

      setStats(statsRes.data.data);
      setPendingApprovals(approvalsRes.data.data);
      setAdmins(adminsRes.data.data.admins);
      setRealtimeActivity(activityRes.data.data.recentActivity);
      setBlockedIPs(blockedRes.data.data.blockedIPs);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/sufimoohaaradmin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeActivity = async () => {
    try {
      const res = await axios.get('/api/super-admin/security/real-time-activity');
      setRealtimeActivity(res.data.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch real-time activity:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/super-admin/auth/logout');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminName');
      navigate('/sufimoohaaradmin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminName');
      navigate('/sufimoohaaradmin/login');
    }
  };

  const handleApproveAdmin = async (adminId, approved) => {
    try {
      await axios.post(`/api/super-admin/management/approve/${adminId}`, {
        approved,
        customPermissions: approved ? customPermissions : null
      });
      
      // Refresh pending approvals
      const res = await axios.get('/api/super-admin/management/pending-approvals');
      setPendingApprovals(res.data.data);
      
      setShowApprovalModal(false);
      setApprovalAdmin(null);
      setCustomPermissions({});
    } catch (error) {
      console.error('Failed to process approval:', error);
      alert('Failed to process approval');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/super-admin/management/create', createForm);
      
      // Refresh admins list
      const res = await axios.get('/api/super-admin/management/all?limit=10');
      setAdmins(res.data.data.admins);
      
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        role: 'editor',
        permissions: {},
        sessionTimeout: 7200000
      });
      
      alert('Admin created successfully! Credentials sent via email.');
    } catch (error) {
      console.error('Failed to create admin:', error);
      alert(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleForceLogout = async (adminId, adminName) => {
    if (confirm(`Force logout ${adminName}? This will terminate all their active sessions.`)) {
      try {
        await axios.post(`/api/super-admin/management/force-logout/${adminId}`);
        alert('Admin logged out successfully');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to force logout:', error);
        alert('Failed to force logout admin');
      }
    }
  };

  const handleBlockIP = async (ipAddress) => {
    const reason = prompt('Enter reason for blocking this IP:');
    if (reason) {
      try {
        await axios.post('/api/super-admin/security/block-ip', {
          ipAddress,
          reason
        });
        alert('IP blocked successfully');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to block IP:', error);
        alert('Failed to block IP');
      }
    }
  };

  const handleUnblockIP = async (ipId, ipAddress) => {
    const reason = prompt('Enter reason for unblocking this IP:');
    if (reason) {
      try {
        await axios.post(`/api/super-admin/security/unblock-ip/${ipId}`, { reason });
        alert('IP unblocked successfully');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to unblock IP:', error);
        alert('Failed to unblock IP');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🟦</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Moohaar Owner Admin</h1>
                <p className="text-sm text-gray-600">Welcome back, {adminName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'approvals', label: 'Approvals', icon: '✅', badge: pendingApprovals.length },
              { id: 'admins', label: 'Admins', icon: '👥' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'activity', label: 'Activity', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">👥</div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.overview?.totalAdmins || 0}</p>
                    <p className="text-sm text-gray-600">Total Admins</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🟢</div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.overview?.onlineAdmins || 0}</p>
                    <p className="text-sm text-gray-600">Online Now</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">⏳</div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.overview?.pendingApprovals || 0}</p>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🚫</div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.overview?.blockedIPs || 0}</p>
                    <p className="text-sm text-gray-600">Blocked IPs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-medium">Create New Admin</div>
                  <div className="text-sm text-gray-600">Add admin, manager, or editor</div>
                </button>
                
                <button
                  onClick={() => setCurrentTab('approvals')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-medium">Review Approvals</div>
                  <div className="text-sm text-gray-600">{pendingApprovals.length} pending</div>
                </button>
                
                <button
                  onClick={() => setCurrentTab('security')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium">Security Center</div>
                  <div className="text-sm text-gray-600">Manage IP blocks & logs</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'approvals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Pending Super Admin Approvals</h2>
              <span className="text-sm text-gray-600">{pendingApprovals.length} pending</span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                <p className="text-gray-600">All super admin registrations have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map(admin => (
                  <div key={admin._id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{admin.name}</h3>
                        <p className="text-gray-600">{admin.email}</p>
                        <p className="text-sm text-gray-500">
                          Registered: {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setApprovalAdmin(admin);
                            setApprovalDecision(false);
                            setShowApprovalModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setApprovalAdmin(admin);
                            setApprovalDecision(true);
                            setCustomPermissions(admin.permissions || {});
                            setShowApprovalModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add other tab contents here... */}
        {/* This is getting quite long, so I'll continue in the next part */}

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Create New Admin</h2>
              </div>
              
              <form onSubmit={handleCreateAdmin} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="editor">Editor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <PermissionMatrix
                  permissions={createForm.permissions}
                  onChange={(permissions) => setCreateForm({...createForm, permissions})}
                  role={createForm.role}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && approvalAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {approvalDecision ? 'Approve' : 'Reject'} Super Admin
                </h2>
                <p className="text-gray-600">
                  {approvalAdmin.name} ({approvalAdmin.email})
                </p>
              </div>
              
              <div className="p-6">
                {approvalDecision ? (
                  <div className="space-y-6">
                    <p className="text-gray-700">
                      Review and customize permissions for this super admin before approval.
                    </p>
                    
                    <PermissionMatrix
                      permissions={customPermissions}
                      onChange={setCustomPermissions}
                      role="super_admin"
                      showPresets={false}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reject Super Admin</h3>
                    <p className="text-gray-600">
                      This will permanently delete the registration request for {approvalAdmin.name}.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setApprovalAdmin(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApproveAdmin(approvalAdmin._id, approvalDecision)}
                    className={`px-4 py-2 text-white rounded-md ${
                      approvalDecision
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approvalDecision ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}