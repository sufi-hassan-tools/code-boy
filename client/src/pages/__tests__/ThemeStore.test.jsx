import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ThemeStore from '../ThemeStore.jsx';
import { getThemes, previewTheme, selectTheme } from '../../services/api';

// Mock the API services
jest.mock('../../services/api');
jest.mock('../../hooks/useApi');

// Mock components
jest.mock('../../components/ThemeCard', () => ({ theme, onPreview, onSelect }) => (
  <div data-testid="theme-card" onClick={() => onPreview(theme._id)}>
    <button onClick={(e) => { e.stopPropagation(); onSelect(theme._id); }}>Select</button>
    <span>{theme.name}</span>
  </div>
));

jest.mock('../../components/PreviewModal', () => ({ html, onClose }) => 
  html ? <div data-testid="preview-modal" onClick={onClose}>Preview Modal</div> : null
);

jest.mock('../../components/Loading', () => () => <div data-testid="loading">Loading...</div>);

describe('ThemeStore', () => {
  const mockThemes = [
    { _id: '1', name: 'Theme 1', description: 'First theme' },
    { _id: '2', name: 'Theme 2', description: 'Second theme' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders themes when data is loaded', () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: { themes: mockThemes }, 
      loading: false, 
      error: null 
    });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Theme 1')).toBeInTheDocument();
    expect(screen.getByText('Theme 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('theme-card')).toHaveLength(2);
  });

  it('renders error message when API fails', () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: null, 
      loading: false, 
      error: { message: 'Failed to load themes' } 
    });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Failed to load themes')).toBeInTheDocument();
  });

  it('handles theme preview', async () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: { themes: mockThemes }, 
      loading: false, 
      error: null 
    });
    
    previewTheme.mockResolvedValue({ data: '<html>Preview</html>' });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    const themeCard = screen.getAllByTestId('theme-card')[0];
    fireEvent.click(themeCard);
    
    await waitFor(() => {
      expect(previewTheme).toHaveBeenCalledWith('1');
    });
  });

  it('handles theme selection', async () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: { themes: mockThemes }, 
      loading: false, 
      error: null 
    });
    
    selectTheme.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    const selectButton = screen.getAllByText('Select')[0];
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(selectTheme).toHaveBeenCalledWith('1');
    });
  });

  it('handles pagination navigation', () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: { themes: mockThemes }, 
      loading: false, 
      error: null 
    });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    const nextButton = screen.getByText('Next');
    const backButton = screen.getByText('Back');
    
    // Back button should be disabled initially
    expect(backButton).toBeDisabled();
    
    // Click next button
    fireEvent.click(nextButton);
    
    // Back button should be enabled after clicking next
    expect(backButton).not.toBeDisabled();
  });

  it('closes preview modal', async () => {
    const mockUseApi = require('../../hooks/useApi').default;
    mockUseApi.mockReturnValue({ 
      data: { themes: mockThemes }, 
      loading: false, 
      error: null 
    });
    
    previewTheme.mockResolvedValue({ data: '<html>Preview</html>' });
    
    render(
      <MemoryRouter>
        <ThemeStore />
      </MemoryRouter>
    );
    
    // Open preview
    const themeCard = screen.getAllByTestId('theme-card')[0];
    fireEvent.click(themeCard);
    
    await waitFor(() => {
      expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
    });
    
    // Close preview
    const modal = screen.getByTestId('preview-modal');
    fireEvent.click(modal);
    
    await waitFor(() => {
      expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
    });
  });
});