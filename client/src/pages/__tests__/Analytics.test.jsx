import { render, screen } from '@testing-library/react';
import Analytics from '../Analytics.jsx';

describe('Analytics', () => {
  it('renders analytics page with title', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Coming soon...')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<Analytics />);
    
    const container = screen.getByText('Analytics').closest('div');
    expect(container).toHaveClass('p-4');
    
    const title = screen.getByText('Analytics');
    expect(title).toHaveClass('text-2xl', 'font-semibold');
    
    const message = screen.getByText('Coming soon...');
    expect(message).toHaveClass('text-gray-600');
  });
});