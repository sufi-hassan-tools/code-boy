import { render, screen, fireEvent } from '@testing-library/react';
import RoleToggleModal from '../RoleToggleModal.jsx';

describe('RoleToggleModal', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'user',
    status: 'active'
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when user is not provided', () => {
    render(<RoleToggleModal user={null} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Edit Roles for')).not.toBeInTheDocument();
  });

  it('renders modal when user is provided', () => {
    render(<RoleToggleModal user={mockUser} onClose={mockOnClose} />);
    
    expect(screen.getByText('Edit Roles for test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RoleToggleModal user={mockUser} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders modal with correct structure', () => {
    render(<RoleToggleModal user={mockUser} onClose={mockOnClose} />);
    
    // Verify the modal renders correctly
    expect(screen.getByText('Edit Roles for test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('displays user email in title', () => {
    const userWithDifferentEmail = { ...mockUser, email: 'different@example.com' };
    render(<RoleToggleModal user={userWithDifferentEmail} onClose={mockOnClose} />);
    
    expect(screen.getByText('Edit Roles for different@example.com')).toBeInTheDocument();
  });
});