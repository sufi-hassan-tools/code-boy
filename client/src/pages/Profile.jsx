import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const userRes = await axios.get('/api/users/me', { withCredentials: true });
        setUser(userRes.data);
      } catch {
        navigate('/login');
        return;
      }
      const result = await axios.get('/api/store/me', { withCredentials: true }).catch(() => null);
      if (result) {
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
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/store/update', formData, { withCredentials: true });
      setStore(res.data);
      alert('Profile updated');
    } catch (err) {
      alert(err.response?.data?.msg || 'Update failed');
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
