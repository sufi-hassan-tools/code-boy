import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 hidden sm:block">
      <nav className="space-y-2">
        <Link to="/admin" className="block hover:underline">Dashboard</Link>
        <Link to="/admin/stores" className="block hover:underline">Stores</Link>
        <Link to="/admin/users" className="block hover:underline">Users</Link>
        <Link to="/admin/themes" className="block hover:underline">Themes</Link>
        <Link to="/admin/settings" className="block hover:underline">Settings</Link>
      </nav>
    </aside>
  );
}
