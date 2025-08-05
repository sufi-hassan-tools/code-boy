import { useEffect, useState } from 'react';
import ThemeCard from '../components/ThemeCard';
import PreviewModal from '../components/PreviewModal';
import { getThemes, previewTheme, selectTheme } from '../services/api';

export default function ThemeStore() {
  const [offset, setOffset] = useState(0);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const limit = 2;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getThemes(offset, limit);
        setThemes(data.themes || []);
      } catch (e) {
        setError('Failed to load themes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [offset]);

  const handlePreview = async (id) => {
    try {
      const html = await previewTheme(id);
      setPreviewHtml(html);
    } catch (e) {
      setError('Failed to load preview');
    }
  };

  const handleSelect = async (id) => {
    try {
      const storeId = localStorage.getItem('storeId');
      await selectTheme(id, storeId);
    } catch (e) {
      setError('Failed to select theme');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
        </div>
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
