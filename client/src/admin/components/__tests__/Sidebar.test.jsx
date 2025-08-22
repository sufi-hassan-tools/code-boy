import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar.jsx';

describe('Sidebar', () => {
  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Stores')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveAttribute('href', '/admin');
    
    const storesLink = screen.getByText('Stores');
    expect(storesLink).toHaveAttribute('href', '/admin/stores');
    
    const usersLink = screen.getByText('Users');
    expect(usersLink).toHaveAttribute('href', '/admin/users');
    
    const themesLink = screen.getByText('Themes');
    expect(themesLink).toHaveAttribute('href', '/admin/themes');
    
    const settingsLink = screen.getByText('Settings');
    expect(settingsLink).toHaveAttribute('href', '/admin/settings');
  });

  it('has correct styling classes', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    const sidebar = screen.getByText('Dashboard').closest('aside');
    expect(sidebar).toHaveClass('w-64', 'bg-gray-800', 'text-white', 'p-4', 'hidden', 'sm:block');
    
    const nav = sidebar.querySelector('nav');
    expect(nav).toHaveClass('space-y-2');
  });

  it('has hover effects on links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('block', 'hover:underline');
    });
  });
});