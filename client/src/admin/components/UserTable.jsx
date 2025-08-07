export default function UserTable({ users = [], onEdit }) {
  return (
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
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.status}</td>
            <td>
              <button onClick={() => onEdit(user)} className="text-blue-600">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
