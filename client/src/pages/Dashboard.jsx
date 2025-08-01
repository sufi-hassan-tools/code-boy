import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));

    const fetchStore = async () => {
      const result = await apiCall('/api/store/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.ok) {
        setStore(result.data);
      }
      setLoading(false);
    };

    fetchStore();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside
        className={`hidden md:flex flex-col w-56 bg-white border-r shadow-sm p-4 space-y-4 ${
          menuOpen ? '' : ''
        }`}
      >
        <Link to="/dashboard" className="hover:text-accent">
          Dashboard
        </Link>
        {!store && (
          <Link to="/create-store" className="hover:text-accent">
            Create Store
          </Link>
        )}
        <Link to="/profile" className="hover:text-accent">
          Profile
        </Link>
        <Link to="/analytics" className="hover:text-accent">
          Analytics
        </Link>
        <button onClick={handleLogout} className="text-left hover:text-accent">
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <nav className="bg-white shadow relative">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <span className="block font-bold text-xl text-primary">Moohaar</span>
              <span className="block font-nastaliq tracking-wide text-gold text-sm">ویبسائٹ آج اور ابھی</span>
            </div>
          </div>
          {/* mobile dropdown */}
          {menuOpen && (
            <div className="md:hidden border-t">
              <div className="flex flex-col p-4 space-y-2">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                  Dashboard
                </Link>
                {!store && (
                  <Link to="/create-store" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                    Create Store
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                  Profile
                </Link>
                <Link to="/analytics" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                  Analytics
                </Link>
                <button onClick={handleLogout} className="text-left hover:text-accent">
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 flex-1">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to your Dashboard!
              </h2>
              <p className="text-gray-600">{user?.name ? `${user.name} - ${user.email}` : user?.email}</p>
              <p className="text-gray-600 mb-8">
                You have successfully logged in. This is your protected dashboard area.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!store && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Create Store</h3>
                    <p className="text-gray-600 mb-4">Set up your online store</p>
                    <button
                      onClick={() => navigate('/create-store')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Get Started
                    </button>
                  </div>
                )}
                {store && (
                  <div className="bg-white p-6 rounded-lg shadow text-left">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">My Store</h3>
                    <p className="text-gray-600 mb-1">{store.storeName}</p>
                    <p className="text-gray-600 mb-1">WhatsApp: {store.storeWhatsapp}</p>
                    <p className="text-gray-600 mb-4">{store.storeAddress}</p>
                    <Link
                      to="/profile"
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Edit Store Info
                    </Link>
                  </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile</h3>
                  <p className="text-gray-600 mb-4">Manage your account settings</p>
                  <Link
                    to="/profile"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block"
                  >
                    View Profile
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 mb-4">View your store analytics</p>
                  <Link
                    to="/analytics"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}

