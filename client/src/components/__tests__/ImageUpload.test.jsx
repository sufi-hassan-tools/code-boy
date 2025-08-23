import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUpload from '../ImageUpload.jsx';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock imageCompression
jest.mock('browser-image-compression', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('ImageUpload', () => {
  const mockOnChange = jest.fn();
  const mockLabel = 'Upload Image';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload label', () => {
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    expect(screen.getByText(mockLabel)).toBeInTheDocument();
  });

  it('renders preview image when value is provided', () => {
    const imageUrl = 'https://example.com/image.jpg';
    render(<ImageUpload label={mockLabel} value={imageUrl} onChange={mockOnChange} />);
    
    const img = screen.getByAltText('preview');
    expect(img).toHaveAttribute('src', imageUrl);
  });

  it('shows uploading state during upload', async () => {
    const { default: imageCompression } = require('browser-image-compression');
    imageCompression.mockResolvedValue(new File([''], 'test.webp', { type: 'image/webp' }));
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button');
    
    fireEvent.click(input);
    const fileInput = screen.getByDisplayValue('');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  it('handles file drop', async () => {
    const { default: imageCompression } = require('browser-image-compression');
    const compressedFile = new File([''], 'test.webp', { type: 'image/webp' });
    imageCompression.mockResolvedValue(compressedFile);
    axios.post.mockResolvedValue({ data: { url: 'https://example.com/uploaded.jpg' } });
    
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    const dropZone = screen.getByText(mockLabel);
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('https://example.com/uploaded.jpg');
    });
  });

  it('prevents default on drag over', () => {
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    const dropZone = screen.getByText(mockLabel);
    const preventDefault = jest.fn();
    
    fireEvent.dragOver(dropZone, { preventDefault });
    
    expect(preventDefault).toHaveBeenCalled();
  });

  it('shows error for non-image files', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button');
    
    fireEvent.click(input);
    const fileInput = screen.getByDisplayValue('');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(alertSpy).toHaveBeenCalledWith('Only images allowed');
    
    alertSpy.mockRestore();
  });

  it('handles upload errors', async () => {
    const { default: imageCompression } = require('browser-image-compression');
    const compressedFile = new File([''], 'test.webp', { type: 'image/webp' });
    imageCompression.mockResolvedValue(compressedFile);
    axios.post.mockRejectedValue(new Error('Upload failed'));
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ImageUpload label={mockLabel} value="" onChange={mockOnChange} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button');
    
    fireEvent.click(input);
    const fileInput = screen.getByDisplayValue('');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Upload failed');
    });
    
    alertSpy.mockRestore();
  });
});