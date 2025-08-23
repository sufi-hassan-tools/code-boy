import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SuperAdminRegister from '../SuperAdminRegister.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SuperAdminRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Moohaar Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Apply for Super Administrator Access')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('shows error for missing required fields', async () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });
  });

  it('shows error for password mismatch', async () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/super-admin/auth/super-admin/register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  it('shows success message and navigates after successful registration', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Super admin registration submitted!/)).toBeInTheDocument();
    });
  });

  it('shows error message on registration failure', async () => {
    axios.post.mockRejectedValue({ 
      response: { 
        data: { 
          message: 'Email already exists' 
        } 
      } 
    });
    
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('disables submit button during loading', async () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('has correct styling classes', () => {
    render(
      <MemoryRouter>
        <SuperAdminRegister />
      </MemoryRouter>
    );
    
    const container = screen.getByText('Moohaar Super Admin').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-purple-500', 'via-indigo-600', 'to-blue-800', 'flex', 'items-center', 'justify-center', 'p-4');
  });
});