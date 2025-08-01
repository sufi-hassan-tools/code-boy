import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

export default function Profile() {
  const [store, setStore] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    storeWhatsapp: '',
    storeAddress: '',
    businessCategory: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    const fetchStore = async () => {
      const result = await apiCall('/api/store/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.ok) {
        setStore(result.data);
        setFormData({
          storeName: result.data.storeName || '',
          storeWhatsapp: result.data.storeWhatsapp || '',
          storeAddress: result.data.storeAddress || '',
          businessCategory: result.data.businessCategory || '',
        });
      }
      setLoading(false);
    };
    fetchStore();
  }, [navigate, token, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await apiCall('/api/store/update', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (result.ok) {
      setStore(result.data);
      alert('Profile updated');
    } else {
      alert(result.data.msg || 'Update failed');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="text-gray-600">{user?.name || user?.email}</p>

      {store ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">WhatsApp</label>
            <input
              type="text"
              name="storeWhatsapp"
              value={formData.storeWhatsapp}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              name="storeAddress"
              value={formData.storeAddress}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Business Category</label>
            <input
              type="text"
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div>No store found. Create one first.</div>
      )}
    </div>
  );
}
