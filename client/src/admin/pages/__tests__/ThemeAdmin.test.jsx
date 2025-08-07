import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ThemeAdmin from '../ThemeAdmin.jsx';
import { getThemes } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getThemes: jest.fn(),
}));

describe('ThemeAdmin Page', () => {
  it('renders without crashing', () => {
    getThemes.mockResolvedValue({ data: { themes: [], total: 0 } });
    render(
      <MemoryRouter>
        <ThemeAdmin />
      </MemoryRouter>
    );
  });
});
