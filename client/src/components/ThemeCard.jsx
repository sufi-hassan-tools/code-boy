export default function ThemeCard({ theme, onPreview, onSelect }) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col space-y-2">
      <img
        src={theme.previewImage}
        alt={`${theme.name} preview`}
        loading="lazy" // Lazy-load images for better performance
        className="w-full h-auto rounded"
      />
      <h3 className="text-lg font-semibold">{theme.name}</h3>
      <p className="text-sm text-gray-600 flex-1">{theme.description}</p>
      <button
        onClick={() => onPreview(theme._id)}
        className="w-full bg-gray-200 py-2 rounded"
      >
        Preview
      </button>
      <button
        onClick={() => onSelect(theme._id)}
        className="w-full bg-indigo-600 text-white py-2 rounded"
      >
        Select
      </button>
    </div>
  );
}
