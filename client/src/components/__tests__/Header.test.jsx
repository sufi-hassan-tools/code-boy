import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and navigation links', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Moohaar')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('shows login link when user is not logged in', async () => {
    axios.get.mockRejectedValue(new Error('Not logged in'));
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  it('navigates to create-store when logged in user clicks create store', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const createStoreButton = screen.getByText('Create Store');
      fireEvent.click(createStoreButton);
      expect(mockNavigate).toHaveBeenCalledWith('/create-store');
    });
  });

  it('navigates to signup when non-logged in user clicks create store', async () => {
    axios.get.mockRejectedValue(new Error('Not logged in'));
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const createStoreButton = screen.getByText('Create Store');
      fireEvent.click(createStoreButton);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  it('toggles mobile menu when hamburger button is clicked', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const menuButton = screen.getByLabelText('Toggle Menu');
      
      // Menu should be hidden initially
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      
      // Click to open menu
      fireEvent.click(menuButton);
      expect(screen.getByText('Home')).toBeInTheDocument();
      
      // Click to close menu
      fireEvent.click(menuButton);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });

  it('closes mobile menu when navigation link is clicked', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const menuButton = screen.getByLabelText('Toggle Menu');
      fireEvent.click(menuButton);
      
      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);
      
      // Menu should be closed
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });
});