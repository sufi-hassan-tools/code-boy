import { useState } from 'react';

export default function UserTable({ onEdit }) {
  const [search, setSearch] = useState('');

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full border rounded p-2 mb-4"
      />
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>user@example.com</td>
            <td>user</td>
            <td>active</td>
            <td>
              <button
                onClick={() => onEdit({ id: 1, email: 'user@example.com' })}
                className="text-blue-600"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
