import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin',
    permissions: {
      themeManagement: false,
      addonManagement: false,
      userManagement: false,
      storeManagement: false,
      analyticsAccess: false,
      systemSettings: false,
    },
  });

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, search]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/superadmin/admins', {
        params: { page: currentPage, limit: 10, search },
        withCredentials: true,
      });
      setAdmins(response.data.admins);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      await axios.post('/api/superadmin/create-admin', newAdmin, { withCredentials: true });
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        role: 'admin',
        permissions: {
          themeManagement: false,
          addonManagement: false,
          userManagement: false,
          storeManagement: false,
          analyticsAccess: false,
          systemSettings: false,
        },
      });
      setShowCreateForm(false);
      
      // Refresh admin list
      fetchAdmins();
      
      alert('Admin created successfully! Invitation email sent.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create admin';
      setError(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdatePermissions = async (adminId, permissions, isActive) => {
    try {
      await axios.put(`/api/superadmin/admins/${adminId}/permissions`, {
        permissions,
        isActive,
      }, { withCredentials: true });
      
      fetchAdmins();
      alert('Admin permissions updated successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update permissions';
      alert(message);
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/superadmin/admins/${adminId}`, { withCredentials: true });
      fetchAdmins();
      alert('Admin deleted successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete admin';
      alert(message);
    }
  };

  const handlePermissionChange = (permission, value) => {
    setNewAdmin({
      ...newAdmin,
      permissions: {
        ...newAdmin.permissions,
        [permission]: value,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
              <p className="text-slate-600">Manage platform administrators</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search admins by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Admins List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading admins...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {admins.map((admin) => (
                    <AdminRow
                      key={admin._id}
                      admin={admin}
                      onUpdatePermissions={handleUpdatePermissions}
                      onDelete={handleDeleteAdmin}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-700">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalAdmins} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Create New Admin</h2>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries({
                    themeManagement: 'Theme Management',
                    addonManagement: 'Addon Management',
                    userManagement: 'User Management',
                    storeManagement: 'Store Management',
                    analyticsAccess: 'Analytics Access',
                    systemSettings: 'System Settings',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAdmin.permissions[key]}
                        onChange={(e) => handlePermissionChange(key, e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin Row Component
function AdminRow({ admin, onUpdatePermissions, onDelete }) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(admin.permissions);
  const [isActive, setIsActive] = useState(admin.isActive);

  const handleSavePermissions = () => {
    onUpdatePermissions(admin._id, permissions, isActive);
    setShowPermissions(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'editor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-slate-900">{admin.name}</div>
            <div className="text-sm text-slate-500">{admin.email}</div>
            {admin.uniqueUrl && (
              <div className="text-xs text-slate-400 mt-1">
                URL: /admin/{admin.uniqueUrl}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
            {admin.role}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            {Object.entries(admin.permissions).filter(([, value]) => value).map(([key]) => (
              <span key={key} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {admin.isActive ? 'Active' : 'Inactive'}
          </span>
          {!admin.isInvitationAccepted && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 ml-1">
              Pending
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {new Date(admin.createdAt).toLocaleDateString()}
          {admin.lastLogin && (
            <div className="text-xs text-slate-400">
              Last: {new Date(admin.lastLogin).toLocaleDateString()}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {admin.role !== 'superadmin' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowPermissions(true)}
                className="text-primary hover:text-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(admin._id, admin.name)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Permission Edit Modal */}
      {showPermissions && (
        <tr>
          <td colSpan="6" className="px-6 py-4 bg-slate-50">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Edit Permissions for {admin.name}</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries({
                  themeManagement: 'Theme Management',
                  addonManagement: 'Addon Management',
                  userManagement: 'User Management',
                  storeManagement: 'Store Management',
                  analyticsAccess: 'Analytics Access',
                  systemSettings: 'System Settings',
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={(e) => setPermissions({
                        ...permissions,
                        [key]: e.target.checked,
                      })}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-slate-700">Active Account</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSavePermissions}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowPermissions(false)}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}