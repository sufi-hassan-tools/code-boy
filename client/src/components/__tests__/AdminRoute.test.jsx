import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminRoute from '../AdminRoute.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  Navigate: ({ to, state }) => <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)}>Navigate to {to}</div>,
  useLocation: () => ({ pathname: '/admin' })
}));

describe('AdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );
    
    // Should render nothing while checking
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('renders outlet when user is admin', async () => {
    axios.get.mockResolvedValue({ data: { role: 'admin' } });
    
    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  it('redirects to admin login when user is not admin', async () => {
    axios.get.mockResolvedValue({ data: { role: 'user' } });
    
    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/admin/login');
    });
  });

  it('redirects to admin login when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/admin/login');
    });
  });

  it('includes location state in redirect', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-state', JSON.stringify({ from: { pathname: '/admin' } }));
    });
  });
});