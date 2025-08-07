import { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import Loading from '../../components/Loading';
import useApi from '../../hooks/useApi';
import { getThemes } from '../../services/api';

export default function ThemeAdmin() {
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const { data, loading, error } = useApi(getThemes, offset, limit);
  const themes = data?.themes || [];

  const next = () => setOffset(offset + limit);
  const back = () => setOffset(Math.max(0, offset - limit));

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-xl">Theme Marketplace</h1>
        {error && (
          <p className="text-red-500 text-center">{error.message || 'Failed to load themes'}</p>
        )}
        {loading ? (
          <Loading />
        ) : (
          <ul className="space-y-2">
            {themes.map((theme) => (
              <li key={theme._id}>{theme.name}</li>
            ))}
          </ul>
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
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
