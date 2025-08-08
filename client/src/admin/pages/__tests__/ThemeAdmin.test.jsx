import { render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ThemeAdmin from '../ThemeAdmin.jsx';
import { getThemes } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getThemes: jest.fn(),
}));

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('ThemeAdmin Page', () => {
  it('renders without crashing', async () => {
    getThemes.mockResolvedValue({ data: { themes: [], total: 0 } });
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ThemeAdmin />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(getThemes).toHaveBeenCalled());
  });
});
