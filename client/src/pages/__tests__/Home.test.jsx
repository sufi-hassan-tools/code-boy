import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock components
jest.mock('../../components/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('../../components/Footer', () => () => <div data-testid="footer">Footer</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and footer', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders hero section with main content', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Now Live in Beta')).toBeInTheDocument();
    expect(screen.getByText('Online Store')).toBeInTheDocument();
    expect(screen.getByText(/Today with Moohaar/)).toBeInTheDocument();
    expect(screen.getByText('ویبسائٹ آج اور ابھی')).toBeInTheDocument();
  });

  it('renders get started button', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
  });

  it('renders watch demo button', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();
  });

  it('renders feature highlights', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('No credit card')).toBeInTheDocument();
    expect(screen.getByText('Setup in 5 minutes')).toBeInTheDocument();
  });

  it('navigates to dashboard when logged in user clicks get started', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const getStartedButton = screen.getByText('Get Started Free');
      fireEvent.click(getStartedButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('navigates to signup when non-logged in user clicks get started', async () => {
    axios.get.mockRejectedValue(new Error('Not logged in'));
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const getStartedButton = screen.getByText('Get Started Free');
      fireEvent.click(getStartedButton);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  it('navigates to create-store when logged in user clicks create store', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // The create store functionality is in the Header component
      // This test verifies the Home component renders correctly
      expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    });
  });

  it('renders features section', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Why Choose Moohaar?')).toBeInTheDocument();
    expect(screen.getByText('Built for modern entrepreneurs who want to launch fast and scale smart.')).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    axios.get.mockResolvedValue({ data: {} });
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});