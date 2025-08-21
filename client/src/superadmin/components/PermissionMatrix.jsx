import { useState, useEffect } from 'react';

const PERMISSION_CATEGORIES = {
  themes: {
    title: 'Theme Management',
    description: 'Control theme upload, editing, and publishing',
    icon: '🎨',
    permissions: {
      view: 'View themes and theme details',
      create: 'Upload new themes',
      edit: 'Edit existing themes',
      delete: 'Delete themes',
      publish: 'Publish/unpublish themes'
    }
  },
  users: {
    title: 'User Management',
    description: 'Manage platform users and their accounts',
    icon: '👥',
    permissions: {
      view: 'View user accounts and details',
      edit: 'Edit user information',
      delete: 'Delete user accounts',
      suspend: 'Suspend/unsuspend user accounts'
    }
  },
  stores: {
    title: 'Store Management',
    description: 'Manage merchant stores and their settings',
    icon: '🏪',
    permissions: {
      view: 'View store details and information',
      edit: 'Edit store settings and information',
      delete: 'Delete store accounts',
      suspend: 'Suspend/unsuspend stores'
    }
  },
  analytics: {
    title: 'Analytics & Reports',
    description: 'Access platform analytics and generate reports',
    icon: '📊',
    permissions: {
      view: 'View basic analytics and reports',
      export: 'Export analytics data',
      advanced: 'Access advanced analytics features'
    }
  },
  adminManagement: {
    title: 'Admin Management',
    description: 'Manage other administrators and their roles',
    icon: '👨‍💼',
    permissions: {
      viewAdmins: 'View admin accounts',
      createAdmins: 'Create new admin accounts',
      editAdmins: 'Edit admin permissions and settings',
      deleteAdmins: 'Delete admin accounts',
      manageRoles: 'Manage admin roles and permissions',
      approveAdmins: 'Approve pending admin registrations'
    }
  },
  system: {
    title: 'System Settings',
    description: 'Access system configuration and security',
    icon: '⚙️',
    permissions: {
      viewSettings: 'View system settings',
      editSettings: 'Edit system configuration',
      viewAuditLogs: 'View audit logs and security events',
      manageBlacklist: 'Manage IP blacklist and security'
    }
  },
  addons: {
    title: 'Add-ons Management',
    description: 'Manage platform add-ons and plugins',
    icon: '🔌',
    permissions: {
      view: 'View available add-ons',
      upload: 'Upload new add-ons',
      edit: 'Edit add-on settings',
      delete: 'Delete add-ons',
      approve: 'Approve/reject add-on submissions'
    }
  }
};

export default function PermissionMatrix({ 
  permissions = {}, 
  onChange, 
  disabled = false, 
  role = 'editor',
  showPresets = true 
}) {
  const [selectedPermissions, setSelectedPermissions] = useState(permissions);

  useEffect(() => {
    setSelectedPermissions(permissions);
  }, [permissions]);

  const handlePermissionChange = (category, permission, checked) => {
    const newPermissions = {
      ...selectedPermissions,
      [category]: {
        ...selectedPermissions[category],
        [permission]: checked
      }
    };

    setSelectedPermissions(newPermissions);
    if (onChange) {
      onChange(newPermissions);
    }
  };

  const handleCategoryToggle = (category, allChecked) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category].permissions;
    const newCategoryPerms = {};
    
    Object.keys(categoryPermissions).forEach(perm => {
      newCategoryPerms[perm] = !allChecked;
    });

    const newPermissions = {
      ...selectedPermissions,
      [category]: newCategoryPerms
    };

    setSelectedPermissions(newPermissions);
    if (onChange) {
      onChange(newPermissions);
    }
  };

  const applyPreset = (presetRole) => {
    let presetPermissions = {};

    switch (presetRole) {
      case 'super_admin':
        presetPermissions = {
          themes: { view: true, create: true, edit: true, delete: true, publish: true },
          users: { view: true, edit: true, delete: false, suspend: true },
          stores: { view: true, edit: true, delete: false, suspend: true },
          analytics: { view: true, export: true, advanced: true },
          adminManagement: { viewAdmins: true, createAdmins: true, editAdmins: true, deleteAdmins: false, manageRoles: true, approveAdmins: false },
          system: { viewSettings: true, editSettings: false, viewAuditLogs: true, manageBlacklist: false },
          addons: { view: true, upload: true, edit: true, delete: true, approve: true }
        };
        break;
      case 'admin':
        presetPermissions = {
          themes: { view: true, create: true, edit: true, delete: false, publish: true },
          users: { view: true, edit: true, delete: false, suspend: false },
          stores: { view: true, edit: true, delete: false, suspend: false },
          analytics: { view: true, export: false, advanced: false },
          adminManagement: { viewAdmins: true, createAdmins: false, editAdmins: false, deleteAdmins: false, manageRoles: false, approveAdmins: false },
          system: { viewSettings: true, editSettings: false, viewAuditLogs: false, manageBlacklist: false },
          addons: { view: true, upload: true, edit: true, delete: false, approve: false }
        };
        break;
      case 'manager':
        presetPermissions = {
          themes: { view: true, create: false, edit: true, delete: false, publish: false },
          users: { view: true, edit: false, delete: false, suspend: false },
          stores: { view: true, edit: true, delete: false, suspend: false },
          analytics: { view: true, export: false, advanced: false },
          adminManagement: { viewAdmins: false, createAdmins: false, editAdmins: false, deleteAdmins: false, manageRoles: false, approveAdmins: false },
          system: { viewSettings: false, editSettings: false, viewAuditLogs: false, manageBlacklist: false },
          addons: { view: true, upload: false, edit: true, delete: false, approve: false }
        };
        break;
      case 'editor':
        presetPermissions = {
          themes: { view: true, create: false, edit: true, delete: false, publish: false },
          users: { view: false, edit: false, delete: false, suspend: false },
          stores: { view: false, edit: false, delete: false, suspend: false },
          analytics: { view: false, export: false, advanced: false },
          adminManagement: { viewAdmins: false, createAdmins: false, editAdmins: false, deleteAdmins: false, manageRoles: false, approveAdmins: false },
          system: { viewSettings: false, editSettings: false, viewAuditLogs: false, manageBlacklist: false },
          addons: { view: true, upload: false, edit: false, delete: false, approve: false }
        };
        break;
      default:
        presetPermissions = {};
    }

    setSelectedPermissions(presetPermissions);
    if (onChange) {
      onChange(presetPermissions);
    }
  };

  const getTotalPermissions = () => {
    let total = 0;
    let granted = 0;
    
    Object.keys(PERMISSION_CATEGORIES).forEach(category => {
      const categoryPerms = PERMISSION_CATEGORIES[category].permissions;
      Object.keys(categoryPerms).forEach(perm => {
        total++;
        if (selectedPermissions[category]?.[perm]) {
          granted++;
        }
      });
    });
    
    return { total, granted };
  };

  const { total, granted } = getTotalPermissions();

  return (
    <div className="space-y-6">
      {/* Header with stats and presets */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Permission Matrix</h3>
            <p className="text-sm text-gray-600">
              {granted} of {total} permissions granted ({Math.round((granted / total) * 100)}%)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(granted / total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {showPresets && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Quick presets:</span>
            {['super_admin', 'admin', 'manager', 'editor'].map(presetRole => (
              <button
                key={presetRole}
                onClick={() => applyPreset(presetRole)}
                disabled={disabled}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  role === presetRole
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {presetRole.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Permission Categories */}
      <div className="space-y-4">
        {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
          const categoryPerms = selectedPermissions[categoryKey] || {};
          const allPermissions = Object.keys(category.permissions);
          const checkedPermissions = allPermissions.filter(perm => categoryPerms[perm]);
          const allChecked = checkedPermissions.length === allPermissions.length;
          const someChecked = checkedPermissions.length > 0;

          return (
            <div key={categoryKey} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">{category.title}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {checkedPermissions.length}/{allPermissions.length}
                  </span>
                  <button
                    onClick={() => handleCategoryToggle(categoryKey, allChecked)}
                    disabled={disabled}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      allChecked
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {allChecked ? 'Uncheck All' : 'Check All'}
                  </button>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(category.permissions).map(([permKey, permDescription]) => {
                  const isChecked = categoryPerms[permKey] || false;
                  
                  return (
                    <label
                      key={permKey}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handlePermissionChange(categoryKey, permKey, e.target.checked)}
                        disabled={disabled}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {permKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                        <div className="text-xs text-gray-600">{permDescription}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">ℹ️</div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Permission Summary</h4>
            <p className="text-sm text-blue-700 mt-1">
              This admin will have access to {granted} out of {total} available permissions. 
              Review carefully before saving as permissions control what actions the admin can perform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}