import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import StoreDetails from '../StoreDetails.jsx';

jest.mock('axios');
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
    axios.get.mockResolvedValue({ data: {} });
    render(
      <MemoryRouter initialEntries={['/admin/stores/1']}>
        <Routes>
          <Route path="/admin/stores/:storeId" element={<StoreDetails />} />
        </Routes>
      </MemoryRouter>
    );
  });
});
