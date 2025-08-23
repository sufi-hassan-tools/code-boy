import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTimeline from '../ActivityTimeline.jsx';

describe('ActivityTimeline', () => {
  const mockActivities = [
    {
      _id: '1',
      type: 'SUCCESSFUL_LOGIN',
      category: 'AUTH',
      severity: 'LOW',
      description: 'Admin login successful',
      adminId: { _id: 'admin1', email: 'admin1@example.com' },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      ipAddress: '192.168.1.1'
    },
    {
      _id: '2',
      type: 'CREATE_ADMIN',
      category: 'ADMIN',
      severity: 'MEDIUM',
      description: 'New admin created',
      adminId: { _id: 'admin2', email: 'admin2@example.com' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      ipAddress: '192.168.1.2'
    },
    {
      _id: '3',
      type: 'THEME_UPLOAD',
      category: 'THEME',
      severity: 'LOW',
      description: 'Theme uploaded',
      adminId: { _id: 'admin1', email: 'admin1@example.com' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      ipAddress: '192.168.1.3'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders activities when provided', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    
    expect(screen.getByText('Admin login successful')).toBeInTheDocument();
    expect(screen.getByText('New admin created')).toBeInTheDocument();
    expect(screen.getByText('Theme uploaded')).toBeInTheDocument();
  });

  it('renders empty state when no activities', () => {
    render(<ActivityTimeline activities={[]} />);
    
    expect(screen.getByText('No activities found')).toBeInTheDocument();
  });

  it('shows filters when showFilters is true', () => {
    render(<ActivityTimeline activities={mockActivities} showFilters={true} />);
    
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
  });

  it('hides filters when showFilters is false', () => {
    render(<ActivityTimeline activities={mockActivities} showFilters={false} />);
    
    expect(screen.queryByText('Category')).not.toBeInTheDocument();
    expect(screen.queryByText('Severity')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Time Range')).not.toBeInTheDocument();
  });

  it('filters activities by category', () => {
    render(<ActivityTimeline activities={mockActivities} showFilters={true} />);
    
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'AUTH' } });
    
    expect(screen.getByText('Admin login successful')).toBeInTheDocument();
    expect(screen.queryByText('New admin created')).not.toBeInTheDocument();
    expect(screen.queryByText('Theme uploaded')).not.toBeInTheDocument();
  });

  it('filters activities by severity', () => {
    render(<ActivityTimeline activities={mockActivities} showFilters={true} />);
    
    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.change(severitySelect, { target: { value: 'MEDIUM' } });
    
    expect(screen.queryByText('Admin login successful')).not.toBeInTheDocument();
    expect(screen.getByText('New admin created')).toBeInTheDocument();
    expect(screen.queryByText('Theme uploaded')).not.toBeInTheDocument();
  });

  it('filters activities by time range', () => {
    render(<ActivityTimeline activities={mockActivities} showFilters={true} />);
    
    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.change(timeRangeSelect, { target: { value: '1h' } });
    
    expect(screen.getByText('Admin login successful')).toBeInTheDocument();
    expect(screen.getByText('New admin created')).toBeInTheDocument();
    expect(screen.queryByText('Theme uploaded')).not.toBeInTheDocument(); // 1 day ago
  });

  it('displays activity icons correctly', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    
    expect(screen.getByText('🔑')).toBeInTheDocument(); // SUCCESSFUL_LOGIN
    expect(screen.getByText('➕')).toBeInTheDocument(); // CREATE_ADMIN
    expect(screen.getByText('🎨')).toBeInTheDocument(); // THEME_UPLOAD
  });

  it('displays admin information', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    
    expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin2@example.com')).toBeInTheDocument();
  });

  it('displays IP addresses', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.3')).toBeInTheDocument();
  });

  it('limits activities to maxItems', () => {
    const manyActivities = Array.from({ length: 10 }, (_, i) => ({
      _id: i.toString(),
      type: 'SUCCESSFUL_LOGIN',
      category: 'AUTH',
      severity: 'LOW',
      description: `Activity ${i}`,
      adminId: { _id: 'admin1', email: 'admin1@example.com' },
      createdAt: new Date().toISOString(),
      ipAddress: '192.168.1.1'
    }));
    
    render(<ActivityTimeline activities={manyActivities} maxItems={5} />);
    
    expect(screen.getByText('Activity 0')).toBeInTheDocument();
    expect(screen.getByText('Activity 4')).toBeInTheDocument();
    expect(screen.queryByText('Activity 5')).not.toBeInTheDocument();
  });
});