import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

export default function ThemeStore() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const init = async () => {
      // Ensure user has a store
      const storeRes = await apiCall('/api/store/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!storeRes.ok) {
        navigate('/create-store');
        return;
      }

      // Dummy themes list
      const dummyThemes = [
        {
          id: 'classic-shop',
          name: 'Classic Shop',
          image: 'https://via.placeholder.com/300x200.png?text=Classic+Shop',
          previewUrl: 'https://example.com/classic-shop',
        },
        {
          id: 'fashion-cart',
          name: 'Fashion Cart',
          image: 'https://via.placeholder.com/300x200.png?text=Fashion+Cart',
          previewUrl: 'https://example.com/fashion-cart',
        },
        {
          id: 'grocery-mart',
          name: 'GroceryMart',
          image: 'https://via.placeholder.com/300x200.png?text=GroceryMart',
          previewUrl: 'https://example.com/grocery-mart',
        },
        {
          id: 'tech-bazaar',
          name: 'Tech Bazaar',
          image: 'https://via.placeholder.com/300x200.png?text=Tech+Bazaar',
          previewUrl: 'https://example.com/tech-bazaar',
        },
      ];
      setThemes(dummyThemes);
      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleSelect = async (themeId) => {
    const token = localStorage.getItem('token');
    const res = await apiCall('/api/store/theme', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ theme: themeId }),
    });
    if (res.ok) {
      navigate('/dashboard');
    } else {
      alert(res.data.msg || 'Failed to select theme');
    }
  };

  const handlePreview = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Choose a Theme</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className="bg-white rounded shadow overflow-hidden">
            <img src={theme.image} alt={theme.name} className="w-full h-32 object-cover" />
            <div className="p-2 text-center">
              <h3 className="text-sm font-medium mb-2">{theme.name}</h3>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePreview(theme.previewUrl)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleSelect(theme.id)}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

