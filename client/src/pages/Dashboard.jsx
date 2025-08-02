import { useState, useEffect } from 'react';

// Mock API function for demonstration
const apiCall = async (endpoint, options = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (endpoint === '/api/store/me') {
    return {
      ok: true,
      data: {
        storeName: "My Awesome Store",
        storeWhatsapp: "+92-300-1234567",
        storeAddress: "123 Main Street, Karachi, Pakistan"
      }
    };
  }
  return { ok: false };
};

export default function Dashboard() {
  const [user, setUser] = useState({ name: "Ahmad Ali" }); // Mock user data
  const [store, setStore] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const fetchStore = async () => {
      const result = await apiCall('/api/store/me');
      if (result.ok) {
        setStore(result.data);
      }
      setLoading(false);
    };

    fetchStore();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    alert('Logout functionality would redirect to login page');
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    setMenuOpen(false);
    alert(`Would navigate to: ${path}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-6 text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    ...(store ? [] : [{ name: 'Create Store', path: '/create-store', icon: '🏪' }]),
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Analytics', path: '/analytics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50
          transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-white shadow-xl border-r border-slate-200
        `}>
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-200">
              <div className="text-center">
                <h1 className="font-bold text-2xl text-emerald-700 mb-1">Moohaar</h1>
                <p className="text-amber-600 text-sm font-medium" style={{fontFamily: 'Nastaliq'}}>
                  ویبسائٹ آج اور ابھی
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200 group"
                    >
                      <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">Store Owner</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-0">
          {/* Mobile Header */}
          <header className="md:hidden bg-white shadow-sm border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="text-center">
                <h1 className="font-bold text-lg text-emerald-700">Moohaar</h1>
              </div>
              <div className="w-10"></div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Welcome back, {user?.name || 'User'}! 👋
                </h2>
                <p className="text-slate-600">
                  Ready to grow your business? Let's make today count.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600">Store Status</p>
                      <p className="text-xl font-semibold text-slate-800">
                        {store ? 'Active' : 'Not Created'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600">Total Views</p>
                      <p className="text-xl font-semibold text-slate-800">1,234</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600">Revenue</p>
                      <p className="text-xl font-semibold text-slate-800">Rs. 25,000</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!store ? (
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">🚀</span>
                      <h3 className="text-xl font-semibold">Create Your Store</h3>
                    </div>
                    <p className="text-emerald-100 mb-6">
                      Get started with your online presence in just a few minutes.
                    </p>
                    <button
                      onClick={() => handleNavigation('/create-store')}
                      className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-200 transform hover:scale-105"
                    >
                      Get Started
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">🏪</span>
                      <h3 className="text-xl font-semibold text-slate-800">My Store</h3>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-slate-700">
                        <span className="font-medium">Name:</span> {store.storeName}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">WhatsApp:</span> {store.storeWhatsapp}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Address:</span> {store.storeAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigation('/profile')}
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                    >
                      Edit Store Info
                      <span className="ml-1">→</span>
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">👤</span>
                    <h3 className="text-xl font-semibold text-slate-800">Profile Settings</h3>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Manage your account settings and preferences.
                  </p>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">📊</span>
                    <h3 className="text-xl font-semibold text-slate-800">Analytics</h3>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Track your store's performance and growth.
                  </p>
                  <button
                    onClick={() => handleNavigation('/analytics')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center py-3 border-b border-slate-100 last:border-b-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-slate-800 font-medium">Store updated successfully</p>
                      <p className="text-sm text-slate-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center py-3 border-b border-slate-100 last:border-b-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">👁</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-slate-800 font-medium">New visitor viewed your store</p>
                      <p className="text-sm text-slate-600">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center py-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600">📱</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-slate-800 font-medium">WhatsApp contact received</p>
                      <p className="text-sm text-slate-600">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}