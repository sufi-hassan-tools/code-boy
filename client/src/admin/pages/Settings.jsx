import AdminLayout from '../layout/AdminLayout';

export default function Settings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl">Global Settings</h1>
        <section>
          <h2 className="font-semibold mb-2">Default Theme</h2>
          <select className="border p-2 w-full">
            <option>Select theme</option>
          </select>
        </section>
        <section>
          <h2 className="font-semibold mb-2">Upload Size Limit</h2>
          <input type="number" className="border p-2 w-full" />
        </section>
        <section>
          <h2 className="font-semibold mb-2">Feature Flags</h2>
          {/* TODO: feature flag toggles */}
        </section>
      </div>
    </AdminLayout>
  );
}
