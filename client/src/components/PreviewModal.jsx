export default function PreviewModal({ html, onClose }) {
  if (!html) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="relative bg-white w-full h-full overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-4 py-2 bg-gray-200 rounded"
        >
          Close
        </button>
        <div className="p-4" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
