export default function RoleToggleModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded space-y-4">
        <div className="text-lg">Edit Roles for {user.email}</div>
        {/* TODO: role selection and status toggle */}
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
