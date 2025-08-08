import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import AdminRoute from '../AdminRoute.jsx';

jest.mock('axios');

describe('AdminRoute', () => {
  it('redirects non-admin users to login', async () => {
    axios.get.mockResolvedValueOnce({ data: { role: 'user' } });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <div>Admin Content</div>
              </AdminRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('allows admin users to proceed', async () => {
    axios.get.mockResolvedValueOnce({ data: { role: 'admin' } });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <div>Admin Content</div>
              </AdminRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
