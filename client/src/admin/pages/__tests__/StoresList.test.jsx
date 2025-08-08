import { render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoresList from '../StoresList.jsx';
import { getStores } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getStores: jest.fn(),
}));

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('StoresList Page', () => {
  it('renders without crashing', async () => {
    getStores.mockResolvedValue({ data: { stores: [], total: 0 } });
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StoresList />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(getStores).toHaveBeenCalled());
  });
});
