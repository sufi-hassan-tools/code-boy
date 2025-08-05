import { useState } from 'react';
import ThemeCard from '../components/ThemeCard';
import PreviewModal from '../components/PreviewModal';
import Loading from '../components/Loading';
import { getThemes, previewTheme, selectTheme } from '../services/api';
import useApi from '../hooks/useApi';

export default function ThemeStore() {
  const [offset, setOffset] = useState(0);
  const [previewHtml, setPreviewHtml] = useState('');
  const limit = 2;

  const { data, loading, error } = useApi(getThemes, offset, limit);
  const themes = data?.themes || [];

  const handlePreview = async (id) => {
    try {
      const htmlRes = await previewTheme(id);
      setPreviewHtml(htmlRes.data || htmlRes);
    } catch {
      // ignore preview errors handled below
    }
  };

  const handleSelect = async (id) => {
    try {
      await selectTheme(id);
    } catch {
      // ignore selection errors handled below
    }
  };

  return (
    <div className="p-4 space-y-4">
      {error && <p className="text-red-500 text-center">{error.message || 'Failed to load themes'}</p>}
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {themes.map((theme) => (
            <ThemeCard key={theme._id} theme={theme} onPreview={handlePreview} onSelect={handleSelect} />
          ))}
        </div>
      )}
      <div className="flex justify-between">
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => setOffset(offset + limit)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
      <PreviewModal html={previewHtml} onClose={() => setPreviewHtml('')} />
    </div>
  );
}
