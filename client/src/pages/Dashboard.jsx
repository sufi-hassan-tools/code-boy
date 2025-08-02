import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState(false);
  const [storeModal, setStoreModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [storeForm, setStoreForm] = useState({ storeName: '', storeWhatsapp: '', storeAddress: '' });
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/users/me');
        setUser(userRes.data);
        setProfileForm(userRes.data);
      } catch {
        navigate('/login');
        return;
      }
      try {
        const storeRes = await axios.get('/api/store/my-store');
        setStore(storeRes.data);
        setStoreForm({
          storeName: storeRes.data.storeName || '',
          storeWhatsapp: storeRes.data.storeWhatsapp || '',
          storeAddress: storeRes.data.storeAddress || ''
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setStore(null);
        } else {
          navigate('/login');
          return;
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/users/me', profileForm);
      setUser(res.data);
      setProfileModal(false);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSave = async () => {
    setSaving(true);
    try {
      if (store) {
        const res = await axios.put('/api/store/update', storeForm);
        setStore(res.data);
      } else {
        const res = await axios.post('/api/store/create', storeForm);
        setStore(res.data.store);
      }
      setStoreModal(false);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 bg-white shadow-xl border-r border-slate-200`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b cursor-pointer" onClick={() => navigate('/')}
          >
            <h1 className="font-bold text-2xl text-emerald-700 mb-1">Moohaar</h1>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => { setMenuOpen(false); navigate(item.path); }}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">{user?.name?.charAt(0)}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
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
            <h1 className="font-bold text-lg text-emerald-700" onClick={() => navigate('/')}>Moohaar</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Profile Card */}
            <div
              onClick={() => setProfileModal(true)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-4">👤 Profile</h3>
              <p className="text-slate-700"><span className="font-medium">Username:</span> {user?.name}</p>
              <p className="text-slate-700"><span className="font-medium">Email:</span> {user?.email}</p>
            </div>

            {/* Store Card */}
            <div
              onClick={() => setStoreModal(true)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer"
            >
              {store ? (
                <>
                  <h3 className="text-xl font-semibold mb-4">🏪 Store</h3>
                  <p className="text-slate-700"><span className="font-medium">Name:</span> {store.storeName}</p>
                  <p className="text-slate-700"><span className="font-medium">WhatsApp:</span> {store.storeWhatsapp}</p>
                  <p className="text-slate-700"><span className="font-medium">Address:</span> {store.storeAddress}</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-3xl mb-2">➕</span>
                  <p className="font-medium">Create Your Store</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full h-full md:h-auto md:w-96 p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <label className="block mb-2 text-sm">Name</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <label className="block mb-2 text-sm">Email</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setProfileModal(false)} className="px-4 py-2">Cancel</button>
              <button
                onClick={handleProfileSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {storeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full h-full md:h-auto md:w-96 p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{store ? 'Edit Store' : 'Create Store'}</h2>
            <label className="block mb-2 text-sm">Store Name</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={storeForm.storeName}
              onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
            />
            <label className="block mb-2 text-sm">WhatsApp</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={storeForm.storeWhatsapp}
              onChange={(e) => setStoreForm({ ...storeForm, storeWhatsapp: e.target.value })}
            />
            <label className="block mb-2 text-sm">Address</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={storeForm.storeAddress}
              onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
            />
            <div className="flex justify-between items-center space-x-2">
              {store && (
                <button
                  className="px-4 py-2 text-emerald-600"
                  onClick={() => { setStoreModal(false); navigate('/themes'); }}
                >
                  Build Your Store
                </button>
              )}
              <div className="ml-auto flex space-x-2">
                <button onClick={() => setStoreModal(false)} className="px-4 py-2">Cancel</button>
                <button
                  onClick={handleStoreSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
