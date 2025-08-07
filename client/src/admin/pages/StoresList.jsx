import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Loading from '../../components/Loading';
import useApi from '../../hooks/useApi';
import { getStores } from '../../services/api';

export default function StoresList() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(getStores, offset, limit, search);
  const stores = data?.stores || [];
  const total = data?.total || 0;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
  };

  const next = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const back = () => {
    if (offset - limit >= 0) {
      setOffset(offset - limit);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search stores..."
          className="w-full border rounded p-2"
        />
        {error && (
          <p className="text-red-500 text-center">{error.message || 'Failed to load stores'}</p>
        )}
        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded shadow p-4 space-y-2">
                <Link to={`/store/${store.handle}`} className="text-lg font-semibold text-blue-600">
                  {store.name}
                </Link>
                <div className="text-sm text-gray-600">@{store.handle}</div>
                <div className="text-sm">{store.ownerEmail}</div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Sales: {store.sales7d}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Sessions: {store.sessions7d}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
