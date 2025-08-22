import { render, screen } from '@testing-library/react';
import Loading from '../Loading.jsx';

describe('Loading', () => {
  it('renders loading component', () => {
    render(<Loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<Loading />);
    
    const loadingElement = screen.getByText('Loading...');
    expect(loadingElement).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
  });
});