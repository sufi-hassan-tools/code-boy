import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function StoreDetails() {
  const { storeId } = useParams();

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [metrics, setMetrics] = useState({});
  const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const fetchMetrics = () => {
    axios
      .get(`/api/admin/stores/${storeId}/metrics`, {
        params: { from: dateFrom, to: dateTo }
      })
      .then((res) => setMetrics(res.data || {}))
      .catch(() => setMetrics({}));
  };

  useEffect(() => {
    if (storeId) fetchMetrics();
  }, [storeId, dateFrom, dateTo]);

  const combinedSessions = (metrics.sessionsByDay || []).map((d, i) => ({
    date: d.date,
    sessions: d.sessions,
    bounce: metrics.bounceByDay?.[i]?.bounce
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 items-end">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="text-xl font-semibold">
              {metrics.salesTotal ?? '-'}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Total Sessions</div>
            <div className="text-xl font-semibold">
              {metrics.sessionsTotal ?? '-'}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Bounce Rate</div>
            <div className="text-xl font-semibold">
              {metrics.bounceRate ?? '-'}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Avg Order Value</div>
            <div className="text-xl font-semibold">
              {metrics.avgOrderValue ?? '-'}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="text-xl font-semibold">
              {metrics.conversionRate ?? '-'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-2 font-semibold">Sales Over Time</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.salesByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-2 font-semibold">Sessions vs. Bounce Rate</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={combinedSessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="bounce" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
