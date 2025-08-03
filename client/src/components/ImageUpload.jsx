import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function ImageUpload({ label, value, onChange }) {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only images allowed');
      return;
    }
    setUploading(true);
    try {
      const options = {
        maxWidthOrHeight: 1024,
        initialQuality: 0.8,
        fileType: 'image/webp',
        useWebWorker: true,
      };
      let compressed = await imageCompression(file, options);
      if (compressed.size > 300 * 1024) {
        alert('Image too large after compression');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('image', compressed, 'image.webp');
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/api/upload/store-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setPreview(res.data.url);
      onChange(res.data.url);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e) => handleFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="mb-4">
      {preview && <img src={preview} alt="preview" className="h-32 object-cover mb-2" />}
      <div
        className="border-dashed border-2 p-4 text-center cursor-pointer"
        onClick={() => fileInput.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploading ? 'Uploading...' : label}
      </div>
      <input type="file" accept="image/*" className="hidden" ref={fileInput} onChange={onFileChange} />
    </div>
  );
}
