import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock all lazy-loaded components
jest.mock('../pages/Dashboard', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('../admin/pages/Dashboard', () => () => <div data-testid="admin-dashboard">Admin Dashboard</div>);
jest.mock('../admin/pages/StoresList', () => () => <div data-testid="stores-list">Stores List</div>);
jest.mock('../admin/pages/StoreDetails', () => () => <div data-testid="store-details">Store Details</div>);
jest.mock('../admin/pages/Users', () => () => <div data-testid="users">Users</div>);
jest.mock('../admin/pages/ThemeAdmin', () => () => <div data-testid="theme-admin">Theme Admin</div>);
jest.mock('../admin/pages/Settings', () => () => <div data-testid="settings">Settings</div>);
jest.mock('../pages/ThemeStore', () => () => <div data-testid="theme-store">Theme Store</div>);
jest.mock('../pages/ThemeUpload', () => () => <div data-testid="theme-upload">Theme Upload</div>);
jest.mock('../superadmin/pages/OwnerAdminRegister', () => () => <div data-testid="owner-admin-register">Owner Admin Register</div>);
jest.mock('../superadmin/pages/OwnerAdminLogin', () => () => <div data-testid="owner-admin-login">Owner Admin Login</div>);
jest.mock('../superadmin/pages/OwnerAdminDashboard', () => () => <div data-testid="owner-admin-dashboard">Owner Admin Dashboard</div>);
jest.mock('../superadmin/pages/SuperAdminRegister', () => () => <div data-testid="super-admin-register">Super Admin Register</div>);
jest.mock('../admin/pages/AdminSecretRegister', () => () => <div data-testid="admin-secret-register">Admin Secret Register</div>);

// Mock other components
jest.mock('../pages/Home', () => () => <div data-testid="home">Home</div>);
jest.mock('../pages/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../pages/Signup', () => () => <div data-testid="signup">Signup</div>);
jest.mock('../admin/pages/Login', () => () => <div data-testid="admin-login">Admin Login</div>);
jest.mock('../admin/pages/Register', () => () => <div data-testid="admin-register">Admin Register</div>);
jest.mock('../pages/Profile', () => () => <div data-testid="profile">Profile</div>);
jest.mock('../pages/Analytics', () => () => <div data-testid="analytics">Analytics</div>);
jest.mock('../pages/CreateStore', () => () => <div data-testid="create-store">Create Store</div>);
jest.mock('../pages/ForgotPassword', () => () => <div data-testid="forgot-password">Forgot Password</div>);
jest.mock('../pages/ResetPassword', () => () => <div data-testid="reset-password">Reset Password</div>);
jest.mock('../components/Loading', () => () => <div data-testid="loading">Loading</div>);
jest.mock('../components/AdminRoute', () => ({ children }) => <div data-testid="admin-route">{children}</div>);

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful authentication for private routes
    axios.get.mockResolvedValue({ data: {} });
  });

  it('renders home page at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('renders login page at /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('renders signup page at /signup route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('signup')).toBeInTheDocument();
  });

  it('renders admin login page at /admin/login route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
  });

  it('renders admin register page at /admin/register route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/register']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('admin-register')).toBeInTheDocument();
  });

  it('renders admin secret register page at /admin/register/:secret route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/register/test-secret']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('admin-secret-register')).toBeInTheDocument();
  });

  it('renders theme store page at /themes route', () => {
    render(
      <MemoryRouter initialEntries={['/themes']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('theme-store')).toBeInTheDocument();
  });

  it('renders forgot password page at /forgot-password route', () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
  });

  it('renders reset password page at /reset-password/:token route', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password/test-token']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('reset-password')).toBeInTheDocument();
  });

  it('renders super admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/sufimoohaaradmin']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('owner-admin-register')).toBeInTheDocument();
  });

  it('renders owner admin login at /sufimoohaaradmin/login route', () => {
    render(
      <MemoryRouter initialEntries={['/sufimoohaaradmin/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('owner-admin-login')).toBeInTheDocument();
  });

  it('renders super admin register at /super-admin/register route', () => {
    render(
      <MemoryRouter initialEntries={['/super-admin/register']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('super-admin-register')).toBeInTheDocument();
  });

  it('renders owner admin dashboard at /owner-admin/dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/owner-admin/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('owner-admin-dashboard')).toBeInTheDocument();
  });
});