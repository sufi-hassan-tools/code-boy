import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StoreDetails from '../StoreDetails.jsx';
import { getStoreMetrics } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getStoreMetrics: jest.fn(),
}));
jest.mock('recharts', () => ({
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

describe('StoreDetails Page', () => {
  it('renders without crashing', () => {
    getStoreMetrics.mockResolvedValue({ data: {} });
    render(
      <MemoryRouter initialEntries={['/admin/stores/1']}>
        <Routes>
          <Route path="/admin/stores/:storeId" element={<StoreDetails />} />
        </Routes>
      </MemoryRouter>
    );
  });
});
