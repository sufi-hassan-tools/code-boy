import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Resolve API base URL automatically, similar to other pages
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

// Page for uploading new themes to the store
export default function ThemeUpload() {
  const navigate = useNavigate();

  // Form state for text fields
  const [form, setForm] = useState({
    name: '',
    handle: '',
    version: '',
    description: '',
    previewImage: '',
  });
  // Selected ZIP file
  const [file, setFile] = useState(null);
  // Track inline errors per field
  const [errors, setErrors] = useState({});
  // Upload state to disable form while submitting
  const [uploading, setUploading] = useState(false);
  // Simple toast message state
  const [toast, setToast] = useState(null);

  // Show temporary toast messages
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Validate all fields before submitting
  const validate = () => {
    const errs = {};
    if (!file) {
      errs.file = 'ZIP file required';
    } else if (file.size > 5 * 1024 * 1024) {
      // 5 MB limit
      errs.file = 'File must be 5MB or less';
    }
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) errs[key] = 'Required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle text field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File must be 5MB or less' });
        setFile(null);
      } else {
        setErrors({ ...errors, file: '' });
        setFile(f);
      }
    }
  };

  // Submit handler to send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/themes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      showToast('Theme uploaded!');
      // Redirect after brief delay so toast is visible
      setTimeout(() => navigate('/themes'), 1500);
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Upload Theme</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Theme ZIP</label>
          <input
            type="file"
            accept=".zip"
            onChange={handleFile}
            className="mt-1 w-full"
          />
          {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Handle</label>
          <input
            name="handle"
            value={form.handle}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
          {errors.handle && <p className="text-red-500 text-sm mt-1">{errors.handle}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Version</label>
          <input
            name="version"
            value={form.version}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
          {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Preview Image URL</label>
          <input
            name="previewImage"
            value={form.previewImage}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
          {errors.previewImage && (
            <p className="text-red-500 text-sm mt-1">{errors.previewImage}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-emerald-600 text-white py-2 rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded text-white ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

