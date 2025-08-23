import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login.jsx';
import { login } from '../../../services/auth.service';

// Mock the auth service
jest.mock('../../../services/auth.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Admin Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Moohaar Admin')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your admin account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('admin@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with correct data', async () => {
    login.mockResolvedValue({ data: { user: { role: 'admin' } } });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123'
      });
    });
  });

  it('navigates to admin dashboard on successful login', async () => {
    login.mockResolvedValue({ data: { user: { role: 'admin' } } });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('shows error for non-admin users', async () => {
    login.mockResolvedValue({ data: { user: { role: 'user' } } });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
  });

  it('shows error message on login failure', async () => {
    login.mockRejectedValue({ 
      response: { 
        data: { 
          error: 'Invalid credentials' 
        } 
      } 
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows generic error message when no specific error is provided', async () => {
    login.mockRejectedValue({ response: {} });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('disables submit button during loading', async () => {
    login.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('renders forgot password link', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('has correct styling classes', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Find the main container div that has the gradient background
    const container = screen.getByText('Moohaar Admin').closest('div').parentElement.parentElement;
    expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-indigo-500', 'via-purple-600', 'to-blue-700', 'flex', 'items-center', 'justify-center', 'p-4');
  });
});