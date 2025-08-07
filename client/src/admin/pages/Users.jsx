import { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import UserTable from '../components/UserTable';
import RoleToggleModal from '../components/RoleToggleModal';

export default function Users() {
  const [activeUser, setActiveUser] = useState(null);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-xl">User Management</h1>
        <UserTable onEdit={setActiveUser} />
        {activeUser && (
          <RoleToggleModal user={activeUser} onClose={() => setActiveUser(null)} />
        )}
      </div>
    </AdminLayout>
  );
}
