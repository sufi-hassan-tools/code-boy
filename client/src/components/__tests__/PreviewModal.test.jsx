import { render, screen, fireEvent } from '@testing-library/react';
import PreviewModal from '../PreviewModal.jsx';

describe('PreviewModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when html is not provided', () => {
    render(<PreviewModal html={null} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('renders modal with content when html is provided', () => {
    const testHtml = '<h1>Test Content</h1>';
    render(<PreviewModal html={testHtml} onClose={mockOnClose} />);
    
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const testHtml = '<h1>Test Content</h1>';
    render(<PreviewModal html={testHtml} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders HTML content correctly', () => {
    const testHtml = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>';
    render(<PreviewModal html={testHtml} onClose={mockOnClose} />);
    
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('has correct modal structure', () => {
    const testHtml = '<h1>Test</h1>';
    render(<PreviewModal html={testHtml} onClose={mockOnClose} />);
    
    // Check for modal overlay - it's the first div with the fixed positioning
    const modal = screen.getByText('Test').closest('div').parentElement.parentElement;
    expect(modal).toHaveClass('fixed', 'inset-0', 'bg-black/60', 'z-50', 'flex', 'items-center', 'justify-center');
    
    // Check for modal content - it's the div containing the content
    const content = screen.getByText('Test').closest('div').parentElement;
    expect(content).toHaveClass('relative', 'bg-white', 'w-full', 'h-full', 'overflow-auto');
  });
});