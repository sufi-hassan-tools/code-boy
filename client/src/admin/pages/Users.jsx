import { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import UserTable from '../components/UserTable';
import RoleToggleModal from '../components/RoleToggleModal';
import Loading from '../../components/Loading';
import useApi from '../../hooks/useApi';
import { getUsers } from '../../services/api';

export default function Users() {
  const [activeUser, setActiveUser] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(getUsers, offset, limit, search);
  const users = data?.users || [];
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
      <div className="space-y-4">
        <h1 className="text-xl">User Management</h1>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search users..."
          className="w-full border rounded p-2"
        />
        {error && (
          <p className="text-red-500 text-center">{error.message || 'Failed to load users'}</p>
        )}
        {loading ? (
          <Loading />
        ) : (
          <UserTable users={users} onEdit={setActiveUser} />
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
        {activeUser && (
          <RoleToggleModal user={activeUser} onClose={() => setActiveUser(null)} />
        )}
      </div>
    </AdminLayout>
  );
}
