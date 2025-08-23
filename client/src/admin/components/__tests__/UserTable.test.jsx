import { render, screen, fireEvent } from '@testing-library/react';
import UserTable from '../UserTable.jsx';

describe('UserTable', () => {
  const mockUsers = [
    { id: '1', email: 'user1@example.com', role: 'user', status: 'active' },
    { id: '2', email: 'user2@example.com', role: 'admin', status: 'inactive' }
  ];

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table headers', () => {
    render(<UserTable users={mockUsers} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders user data in table rows', () => {
    render(<UserTable users={mockUsers} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<UserTable users={mockUsers} onEdit={mockOnEdit} />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('renders empty table when no users provided', () => {
    render(<UserTable users={[]} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Should not have any user data
    expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
  });

  it('renders empty table when users prop is undefined', () => {
    render(<UserTable onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<UserTable users={mockUsers} onEdit={mockOnEdit} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full');
    
    const editButtons = screen.getAllByText('Edit');
    editButtons.forEach(button => {
      expect(button).toHaveClass('text-blue-600');
    });
  });
});