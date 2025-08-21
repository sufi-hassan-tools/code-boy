import { useState, useEffect } from 'react';

const ACTIVITY_ICONS = {
  SUCCESSFUL_LOGIN: '🔑',
  FAILED_LOGIN: '❌',
  FAILED_2FA: '🔐',
  LOGOUT: '🚪',
  CREATE_ADMIN: '➕',
  DELETE_ADMIN: '🗑️',
  SUSPEND_ADMIN: '⏸️',
  APPROVE_SUPER_ADMIN: '✅',
  REJECT_SUPER_ADMIN: '❌',
  FORCE_LOGOUT: '🔴',
  THEME_UPLOAD: '🎨',
  THEME_DELETE: '🗑️',
  USER_DELETE: '👤',
  STORE_SUSPEND: '🏪',
  BLOCK_IP: '🚫',
  UNBLOCK_IP: '🔓',
  SYSTEM_SETTINGS: '⚙️',
};

const SEVERITY_COLORS = {
  LOW: 'text-green-600 bg-green-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  HIGH: 'text-orange-600 bg-orange-100',
  CRITICAL: 'text-red-600 bg-red-100',
};

const CATEGORY_COLORS = {
  AUTH: 'border-blue-200 bg-blue-50',
  ADMIN: 'border-purple-200 bg-purple-50',
  THEME: 'border-pink-200 bg-pink-50',
  USER: 'border-green-200 bg-green-50',
  STORE: 'border-yellow-200 bg-yellow-50',
  SYSTEM: 'border-red-200 bg-red-50',
  ADDON: 'border-indigo-200 bg-indigo-50',
};

export default function ActivityTimeline({ 
  activities = [], 
  showFilters = true, 
  maxItems = 50,
  realTime = false 
}) {
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [filters, setFilters] = useState({
    category: 'all',
    severity: 'all',
    admin: 'all',
    timeRange: '24h'
  });

  useEffect(() => {
    let filtered = [...activities];

    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === filters.category);
    }

    if (filters.severity !== 'all') {
      filtered = filtered.filter(activity => activity.severity === filters.severity);
    }

    if (filters.admin !== 'all') {
      filtered = filtered.filter(activity => activity.adminId?._id === filters.admin);
    }

    // Apply time range filter
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    if (timeRanges[filters.timeRange]) {
      const cutoff = new Date(now.getTime() - timeRanges[filters.timeRange]);
      filtered = filtered.filter(activity => new Date(activity.createdAt) >= cutoff);
    }

    // Sort by most recent first and limit
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered = filtered.slice(0, maxItems);

    setFilteredActivities(filtered);
  }, [activities, filters, maxItems]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getUniqueAdmins = () => {
    const adminMap = new Map();
    activities.forEach(activity => {
      if (activity.adminId) {
        adminMap.set(activity.adminId._id, activity.adminId);
      }
    });
    return Array.from(adminMap.values());
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              >
                <option value="all">All Categories</option>
                <option value="AUTH">Authentication</option>
                <option value="ADMIN">Admin Management</option>
                <option value="THEME">Themes</option>
                <option value="USER">Users</option>
                <option value="STORE">Stores</option>
                <option value="SYSTEM">System</option>
                <option value="ADDON">Add-ons</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
              <select
                value={filters.admin}
                onChange={(e) => setFilters({...filters, admin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              >
                <option value="all">All Admins</option>
                {getUniqueAdmins().map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name} ({admin.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Real-time indicator */}
      {realTime && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live activity feed</span>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Activity Timeline
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({filteredActivities.length} activities)
            </span>
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">No activities match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity, index) => (
                <div key={activity._id || index} className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${CATEGORY_COLORS[activity.category] || 'border-gray-200 bg-gray-50'}`}>
                      {ACTIVITY_ICONS[activity.action] || '📝'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.adminId?.name || 'System'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[activity.severity] || 'text-gray-600 bg-gray-100'}`}>
                            {activity.severity}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {activity.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {activity.ipAddress && (
                            <span>IP: {activity.ipAddress}</span>
                          )}
                          <span>{formatTimestamp(activity.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">
                        {activity.description}
                      </p>

                      {/* Target info */}
                      {activity.target && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Target:</span> {activity.target.type} - {activity.target.name || activity.target.id}
                        </div>
                      )}

                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <details className="cursor-pointer">
                            <summary className="font-medium hover:text-gray-800">View Details</summary>
                            <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}

                      {/* Status indicator */}
                      {activity.status !== 'SUCCESS' && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status}
                          </span>
                          {activity.error && (
                            <span className="ml-2 text-xs text-red-600">{activity.error}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}